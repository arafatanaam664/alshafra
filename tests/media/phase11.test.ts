import { applyMigrations, fromPglite, seedDatabase } from '@alshafra/database';
import {
  buildR2Request,
  createStorageFromEnv,
  decodeBase64Upload,
  ingestEditorial,
  isR2Configured,
  mediaObjectKey,
  mediaStatus,
  MemoryStorage,
  publicObjectUrl,
  runMediaGc,
  sha256Hex,
  softDeleteMedia,
  validateEditorialImage,
} from '@alshafra/media';
import { handleAdminApi, provisionStaff } from '@alshafra/cms';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

const PNG_1X1 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function pngBytes(): Uint8Array {
  return decodeBase64Upload(PNG_1X1);
}

async function main() {
  const png = pngBytes();
  const ok = validateEditorialImage(png, 'image/png');
  if (ok.width !== 1 || ok.height !== 1) fail(`png size ${ok.width}x${ok.height}`);
  if (ok.mime !== 'image/png') fail('png mime');

  try {
    validateEditorialImage(Uint8Array.from(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), 'image/svg+xml');
    fail('svg must be rejected');
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'svg_forbidden') fail(`svg error ${error}`);
  }

  try {
    validateEditorialImage(png, 'image/jpeg');
    fail('mime mismatch must fail');
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'mime_mismatch') fail(`mismatch ${error}`);
  }

  try {
    validateEditorialImage(new Uint8Array(8 * 1024 * 1024 + 1), 'image/png');
    fail('oversize must fail');
  } catch (error) {
    if (!(error instanceof Error) || error.message !== 'file_too_large') fail(`oversize ${error}`);
  }

  const key = mediaObjectKey('01900000-0000-7000-8000-000000000001', 'original', 'png', new Date('2026-08-22T00:00:00Z'));
  if (key !== 'media/2026/08/01900000-0000-7000-8000-000000000001/original.png') fail(`key ${key}`);

  if (publicObjectUrl('media/x.png')) fail('no public url without base');
  if (publicObjectUrl('media/x.png', 'https://media.alshafra.com/') !== 'https://media.alshafra.com/media/x.png') {
    fail('public url normalize');
  }
  if (publicObjectUrl('private/x.png', 'https://media.alshafra.com') !== null) fail('private must not be public');

  process.env.MEDIA_DRIVER = 'memory';
  delete process.env.R2_ACCOUNT_ID;
  delete process.env.R2_ACCESS_KEY_ID;
  delete process.env.R2_SECRET_ACCESS_KEY;
  delete process.env.R2_BUCKET;
  if (isR2Configured()) fail('r2 should be off without keys');
  if (createStorageFromEnv().driver !== 'memory') fail('memory driver');
  const status = mediaStatus();
  if (status.r2Configured) fail('status leaked r2');
  if (JSON.stringify(status).toLowerCase().includes('secret')) fail('status must not mention secrets');

  const signed = buildR2Request(
    {
      accountId: 'acc',
      accessKeyId: 'AKIAEXAMPLE',
      secretAccessKey: 'super-secret-value-do-not-leak',
      bucket: 'alshafra-media',
    },
    'PUT',
    'media/2026/08/id/original.png',
    png,
    { 'content-type': 'image/png' },
    new Date('2026-08-22T12:00:00Z'),
  );
  if (!signed.url.includes('alshafra-media/media/2026/08/id/original.png')) fail(`r2 url ${signed.url}`);
  if (!signed.headers.authorization?.includes('AWS4-HMAC-SHA256 Credential=AKIAEXAMPLE/')) fail('missing credential');
  if (JSON.stringify(signed).includes('super-secret-value-do-not-leak')) fail('secret leaked into signed request');

  const mem = new MemoryStorage();
  await mem.put({ key: 'k', bytes: png, contentType: 'image/png' });
  if ((await mem.get('k'))?.byteLength !== png.byteLength) fail('memory get');
  await mem.delete('k');
  if (await mem.get('k')) fail('memory delete');

  process.env.ALSHAFRA_ENV = 'development';
  process.env.ADMIN_DEV_LOGIN = 'true';
  process.env.ADMIN_SESSION_SECRET = 'test-secret-phase11';

  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  const client = fromPglite(db);
  await applyMigrations(client);
  await seedDatabase(client);

  const first = await ingestEditorial(client, mem, {
    filename: 'dot.png',
    contentType: 'image/png',
    bytes: png,
    alt: 'نقطة',
    uploadedBy: null,
  });
  if (first.reused) fail('first ingest reused');
  if (first.media.width !== 1) fail('ingest width');
  const second = await ingestEditorial(client, mem, {
    filename: 'dot2.png',
    contentType: 'image/png',
    bytes: png,
  });
  if (!second.reused || second.media.id !== first.media.id) fail('dedupe failed');
  if (sha256Hex(png) !== first.media.sha256) fail('sha mismatch');

  const editorLogin = await handleAdminApi(
    {
      method: 'POST',
      pathname: '/api/v1/admin/auth/login',
      search: '',
      headers: {},
      body: { email: 'editor@local.test' },
    },
    client,
  );
  if (editorLogin.status !== 200) fail(`editor login ${editorLogin.status}`);
  const cookie = editorLogin.headers?.['Set-Cookie'] || '';

  const uploaded = await handleAdminApi(
    {
      method: 'POST',
      pathname: '/api/v1/admin/media',
      search: '',
      headers: { cookie },
      body: { filename: 'a.png', contentType: 'image/png', base64: PNG_1X1, alt: 'أ' },
    },
    client,
  );
  if (uploaded.status !== 200 && uploaded.status !== 201) {
    fail(`upload ${uploaded.status} ${JSON.stringify(uploaded.body)}`);
  }

  const listed = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/media', search: '', headers: { cookie } },
    client,
  );
  if (listed.status !== 200) fail(`list ${listed.status}`);
  const items = listed.body as { id: string }[];
  if (!items.length) fail('library empty');

  const st = await handleAdminApi(
    { method: 'GET', pathname: '/api/v1/admin/media/status', search: '', headers: { cookie } },
    client,
  );
  if (st.status !== 200) fail('status');
  if (JSON.stringify(st.body).includes('super-secret')) fail('status body secret');

  const analyst = await provisionStaff(client, 'analyst@local.test', 'analyst');
  void analyst;
  const analystLogin = await handleAdminApi(
    {
      method: 'POST',
      pathname: '/api/v1/admin/auth/login',
      search: '',
      headers: {},
      body: { email: 'analyst@local.test' },
    },
    client,
  );
  const ac = analystLogin.headers?.['Set-Cookie'] || '';
  const denied = await handleAdminApi(
    {
      method: 'POST',
      pathname: '/api/v1/admin/media',
      search: '',
      headers: { cookie: ac },
      body: { filename: 'a.png', contentType: 'image/png', base64: PNG_1X1 },
    },
    client,
  );
  if (denied.status !== 403) fail(`analyst upload ${denied.status}`);

  await softDeleteMedia(client, first.media.id);
  await client.query(`UPDATE media SET deleted_at = now() - interval '40 days' WHERE id = $1`, [first.media.id]);
  const gc = await runMediaGc(client, mem, 30);
  if (gc.deleted < 1) fail('gc should remove unreferenced deleted media');

  console.log(
    JSON.stringify(
      {
        ok: true,
        key,
        ingestId: first.media.id,
        variantsPlanned: first.variantsPlanned.length,
        upload: uploaded.status,
        driver: status.driver,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
