import { createHash, createHmac } from 'node:crypto';

export interface Aws4Input {
  method: string;
  url: URL;
  headers: Record<string, string>;
  body: Uint8Array;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service: string;
  now?: Date;
}

function sha256Hex(data: Uint8Array | string): string {
  return createHash('sha256').update(data).digest('hex');
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest();
}

function amzDate(now: Date): { short: string; long: string } {
  const iso = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  return { short: iso.slice(0, 8), long: iso };
}

export function signAwsV4(input: Aws4Input): { headers: Record<string, string>; canonicalRequest: string } {
  const now = input.now ?? new Date();
  const { short, long } = amzDate(now);
  const payloadHash = sha256Hex(input.body);
  const headers: Record<string, string> = {
    host: input.url.host,
    'x-amz-date': long,
    'x-amz-content-sha256': payloadHash,
  };
  for (const [name, value] of Object.entries(input.headers)) {
    headers[name.toLowerCase()] = value;
  }

  const signedNames = Object.keys(headers).sort();
  const canonicalHeaders = signedNames.map((name) => `${name}:${headers[name]}\n`).join('');
  const signedHeaderList = signedNames.join(';');
  const canonicalQuery = [...input.url.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const canonicalRequest = [
    input.method.toUpperCase(),
    input.url.pathname,
    canonicalQuery,
    canonicalHeaders,
    signedHeaderList,
    payloadHash,
  ].join('\n');

  const scope = `${short}/${input.region}/${input.service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', long, scope, sha256Hex(canonicalRequest)].join('\n');
  const dateKey = hmac(`AWS4${input.secretAccessKey}`, short);
  const regionKey = hmac(dateKey, input.region);
  const serviceKey = hmac(regionKey, input.service);
  const signingKey = hmac(serviceKey, 'aws4_request');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  headers.authorization = `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${scope}, SignedHeaders=${signedHeaderList}, Signature=${signature}`;
  return { headers, canonicalRequest };
}
