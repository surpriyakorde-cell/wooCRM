import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const dir = await mkdtemp(path.join(os.tmpdir(), 'woocrm-test-'));
process.env.NODE_ENV = 'test';
process.env.CRM_DATA_FILE = path.join(dir, 'crm.json');
const { app } = await import('../app.js');
const server = app.listen(0);
const base = await new Promise(resolve => server.once('listening', () => resolve(`http://127.0.0.1:${server.address().port}`)));
test('customer status persists and invalid status is rejected', async () => {
  const update = await fetch(`${base}/api/customers/101`, { method:'PATCH', headers:{'content-type':'application/json'}, body:JSON.stringify({status:'At Risk'}) });
  assert.equal(update.status, 200);
  const list = await fetch(`${base}/api/customers`).then(r=>r.json());
  assert.equal(list.data.find(c=>c.id===101).status, 'At Risk');
  const bad = await fetch(`${base}/api/customers/101`, { method:'PATCH', headers:{'content-type':'application/json'}, body:JSON.stringify({status:'Lost'}) });
  assert.equal(bad.status, 400);
});
test('reviews validate and workflow status persists', async () => {
  const bad = await fetch(`${base}/api/reviews`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({rating:8,text:'Oops',customer_id:101}) });
  assert.equal(bad.status, 400);
  const initial = await fetch(`${base}/api/reviews`).then(r=>r.json());
  const id = initial.data[0].id;
  const saved = await fetch(`${base}/api/reviews/${id}`, { method:'PATCH', headers:{'content-type':'application/json'}, body:JSON.stringify({status:'Resolved'}) });
  assert.equal((await saved.json()).status, 'Resolved');
  const persisted = await fetch(`${base}/api/reviews`).then(r=>r.json());
  assert.equal(persisted.data.find(r=>r.id===id).status, 'Resolved');
});
test.after(async () => { await new Promise(resolve=>server.close(resolve)); await rm(dir,{recursive:true,force:true}); });
