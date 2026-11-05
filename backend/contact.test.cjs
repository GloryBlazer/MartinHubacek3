const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const base = process.env.API_BASE_URL || 'http://127.0.0.1:5080';
const valid = {name:' Test visitor ',email:'visitor@example.com',subject:' Contact test ',message:' A test message. '};
const send = payload => fetch(`${base}/api/contact`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
(async () => {
  for (const payload of [{}, {...valid,name:'   '}, {...valid,email:'invalid'}, {...valid,message:'x'.repeat(4001)}, null]) {
    const response = await send(payload);
    assert.equal(response.status,400);
    assert.match(response.headers.get('content-type'), /problem\+json/);
    await response.arrayBuffer();
  }
  const response = await send(valid);
  assert.equal(response.status,201);
  const receipt = await response.json();
  assert.match(receipt.id,/^[0-9a-f-]{36}$/);
  assert.equal(receipt.email,undefined);
  const directory = process.env.CONTACT_STORAGE_PATH || path.join(__dirname,'bin','Debug','net10.0','App_Data','contacts');
  const stored = JSON.parse(await fs.readFile(path.join(directory,receipt.id.replaceAll('-','')+'.json'),'utf8'));
  assert.equal(stored.name,'Test visitor');
  assert.equal(stored.email,valid.email);
  assert.equal(stored.subject,'Contact test');
  assert.equal(stored.message,'A test message.');
  for (const url of [`/api/contact/${receipt.id}`,`/App_Data/contacts/${receipt.id.replaceAll('-','')}.json`]) {
    const privateResponse = await fetch(base+url);
    assert.equal(privateResponse.status,404);
    await privateResponse.arrayBuffer();
  }
  const oversized = await send({...valid,message:'x'.repeat(33000)});
  assert.equal(oversized.status,413);
  // Kestrel can close the connection after rejecting an oversized upload.
  await oversized.body.cancel();
  console.log('Contact checks passed: validation, receipt, normalized storage, body limit, and private-file isolation.');
  process.exit(0);
})().catch(error=>{console.error(error);process.exit(1);});
