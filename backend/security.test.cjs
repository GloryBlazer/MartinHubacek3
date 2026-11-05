'use strict';
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const dll = path.join(__dirname, 'bin', 'Debug', 'net10.0', 'Portfolio.Api.dll');
const base = 'http://127.0.0.1:5097';

function start(environment) {
  const child = spawn('dotnet', [dll, '--urls', base], {
    env: { ...process.env, ASPNETCORE_ENVIRONMENT: 'Production', ...environment },
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  return { child, output: () => output };
}

async function runChecks(file, env) {
  const child = spawn(process.execPath, [file], {
    env: { ...process.env, ...env }, windowsHide: true, stdio: 'inherit'
  });
  const [code] = await once(child, 'exit');
  assert.equal(code, 0, file);
}

(async () => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-security-'));
  const storage = {
    ContactStorage__Path: path.join(temporary, 'contacts'),
    SubmissionStorage__Path: path.join(temporary, 'submissions')
  };
  let running;
  try {
    for (const setting of ['ContactStorage__Path', 'SubmissionStorage__Path']) {
      for (const suffix of ['', 'private']) {
        const invalid = start({ ...storage, [setting]: path.join(path.dirname(dll), 'wwwroot', suffix) });
        const watchdog = setTimeout(() => invalid.child.kill(), 10000);
        try {
          const [code] = await once(invalid.child, 'exit');
          assert.notEqual(code, 0);
          assert.match(invalid.output(), /Private storage must be outside the public web root/);
        } finally {
          clearTimeout(watchdog);
          if (invalid.child.exitCode === null) invalid.child.kill();
        }
      }
    }
    running = start(storage);
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (running.child.exitCode !== null) throw new Error(running.output());
      // Match this child process, so an unrelated server cannot satisfy readiness.
      if (running.output().includes('Application started.')) { ready = true; break; }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, running.output());
    for (const url of ['/', '/api/health', '/missing']) {
      const response = await fetch(base + url);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(response.headers.get('x-frame-options'), 'DENY');
      assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
      assert.equal(response.headers.get('server'), null);
      await response.arrayBuffer();
    }
    const env = { API_BASE_URL: base, CONTACT_STORAGE_PATH: storage.ContactStorage__Path };
    await runChecks(path.join(__dirname, '..', 'js_projekt', 'questionnaire.test.cjs'), env);
    await runChecks(path.join(__dirname, 'contact.test.cjs'), env);
    const submit = await fetch(base + '/api/questionnaire/submissions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: { q1: 1, q2: 2, q3: 3, q4: 4, q5: 5 } })
    });
    assert.equal(submit.status, 201);
    assert.match(submit.headers.get('cache-control'), /no-store/);
    const saved = await submit.json();
    const read = await fetch(base + '/api/questionnaire/submissions/' + saved.id);
    assert.match(read.headers.get('cache-control'), /no-store/);
    await read.arrayBuffer();
    for (const [endpoint, count] of [['/api/contact', 11], ['/api/questionnaire/submissions', 31]]) {
      let last;
      for (let i = 0; i < count; i++) {
        last = await fetch(base + endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `192.0.2.${i}` }, body: '{}'
        });
        assert.ok([400, 429].includes(last.status));
        await last.arrayBuffer();
      }
      assert.equal(last.status, 429, 'Spoofed forwarding headers must not bypass rate limits');
    }
    console.log('Security checks passed: unsafe storage rejected, headers, cache protection, and rate limits.');
  } finally {
    if (running && running.child.exitCode === null) {
      running.child.kill();
      await once(running.child, 'exit');
    }
    // Only remove the temporary directory created by this test.
    assert.equal(path.dirname(temporary), path.resolve(os.tmpdir()));
    assert.ok(path.basename(temporary).startsWith('portfolio-security-'));
    await fs.rm(temporary, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
