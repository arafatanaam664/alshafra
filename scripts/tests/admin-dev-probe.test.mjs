import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDevConnection, publicKeyOnly } from '../admin-dev-probe.mjs';
const payload = role => `x.${Buffer.from(JSON.stringify({role})).toString('base64url')}.x`;
test('development probe rejects service and secret keys', () => {
  assert.equal(publicKeyOnly('sb_publishable_abc'), true);
  assert.equal(publicKeyOnly(payload('anon')), true);
  assert.equal(publicKeyOnly(payload('service_role')), false);
  assert.equal(publicKeyOnly('sb_secret_abc'), false);
});
function fixture({role='editor', failTable, loginError=false}={}) {
  let signedOut = false; const tables = [];
  const factory = (url, key) => {
    assert.equal(url, 'https://itcpwcifkvuhbdwxdgrf.supabase.co'); assert.equal(key, 'sb_publishable_abc');
    return {
      auth: {
        signInWithPassword: async () => loginError ? {error:{message:'hidden'}} : {data:{user:{id:'fixture'},session:{}}},
        getUser: async () => ({data:{user:{id:'fixture'}}}),
        signOut: async () => { signedOut = true; },
      },
      from(table) { tables.push(table); return {select() {return this;},eq() {return this;},limit: async () => ({error:table===failTable ? {} : null}),maybeSingle: async () => ({data:role ? {role} : null})}; },
    };
  };
  return {factory, tables, get signedOut(){return signedOut;}};
}
test('probe checks login, role and read-only tables then signs out', async () => {
  const f = fixture();
  assert.deepEqual(await checkDevConnection({key:'sb_publishable_abc',email:'fixture',password:'not-real',clientFactory:f.factory}), {role:'editor'});
  assert.deepEqual(f.tables, ['date_events','admin_profiles','articles','official_sources','date_events']);
  assert.equal(f.signedOut, true);
});
test('probe fails closed without a role or on a read error', async () => {
  for (const options of [{role:null},{failTable:'articles'}]) {
    const f=fixture(options);
    await assert.rejects(checkDevConnection({key:'sb_publishable_abc',email:'fixture',password:'not-real',clientFactory:f.factory}));
    assert.equal(f.signedOut, true);
  }
});
