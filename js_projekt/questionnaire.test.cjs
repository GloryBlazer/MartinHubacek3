const assert = require('node:assert/strict');
const base = process.env.API_BASE_URL || 'http://127.0.0.1:5080';
async function submit(answers) {
  return fetch(`${base}/api/questionnaire/submissions`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({answers})});
}
(async () => {
  const definition = await (await fetch(`${base}/api/questionnaire`)).json();
  assert.equal(definition.questions.length, 5);
  const ids = definition.questions.map(question => question.id);
  const descriptions = [];
  for (const values of [[1,1,1,1,1],[5,5,5,5,5],[1,2,3,4,5],[1,1,1,3,5],[1,1,1,4,5],[3,3,3,4,5],[3,3,3,5,5]]) {
    const response = await submit(Object.fromEntries(ids.map((id,index) => [id,values[index]])));
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.equal(result.score, values.reduce((a,b) => a+b));
    assert.equal(result.maxScore, 25);
    assert.deepEqual(result.answers.map(answer => answer.value), values);
    const retrieved = await fetch(new URL(response.headers.get('location'), base));
    assert.equal(retrieved.status, 200);
    assert.deepEqual(await retrieved.json(), result);
    descriptions.push(result.description);
  }
  assert.equal(descriptions[0], descriptions[3]);
  assert.notEqual(descriptions[3], descriptions[4]);
  assert.notEqual(descriptions[5], descriptions[6]);
  for (const answers of [null,{}, {q1:1}, {q1:1,q2:2,q3:3,q4:4,q5:0}, {q1:1,q2:2,q3:3,q4:4,q5:6}, {q1:1,q2:2,q3:3,q4:4,other:5}, {q1:1,q2:2,q3:3,q4:4,q5:1.5}, {q1:1,q2:2,q3:3,q4:4,q5:'5'}, {q1:1,q2:2,q3:3,q4:4,q5:5,q6:1}]) {
    assert.equal((await submit(answers)).status, 400);
  }
  const malformed = await fetch(`${base}/api/questionnaire/submissions`, {method:'POST',headers:{'Content-Type':'application/json'},body:'{'});
  assert.equal(malformed.status, 400);
  assert.equal((await fetch(`${base}/api/questionnaire/submissions/00000000-0000-0000-0000-000000000000`)).status,404);
  assert.equal((await fetch(`${base}/api/questionnaire/submissions/not-a-guid`)).status,404);
  for (const page of ['/','/dovednosti.html','/reference.html','/kontakt.html']) {
    const html = await (await fetch(base + page)).text();
    assert.match(html, /href="js_projekt\/Questionaire.html">Dotazník/);
    assert.match(html, /href="hravy_zivot\/index.html">Hravý život/);
  }
  for (const [shortcut, destination] of [['/dotaznik','/js_projekt/Questionaire.html'], ['/hravy-zivot','/hravy_zivot/index.html']]) {
    const response = await fetch(base + shortcut, {redirect:'manual'});
    assert.equal(response.status,302);
    assert.equal(response.headers.get('location'),destination);
  }
  const home = await fetch(base + '/index.html');
  assert.equal(home.headers.get('cache-control'),'no-cache');
  const logoPath = '/hravy_zivot/' + 'asety/Lukaš logo/PDF_křivky/loga-barva-2-PNG(1).png'.split('/').map(encodeURIComponent).join('/');
  assert.equal((await fetch(base + logoPath)).status,200);
  for (const path of ['/index.html','/js_projekt/Questionaire.html','/js_projekt/questionnaire.js','/obrazky/person_circle_icon.ico','/hravy_zivot/index.html']) assert.equal((await fetch(base + path)).status,200,path);
  for (const path of ['/README.md','/Program.cs','/hravy_zivot/filezilla%20prihlasovani.txt','/App_Data/submissions','/js_projekt/questionnaire.test.cjs']) assert.equal((await fetch(base + path)).status,404,path);
  console.log('API integration checks passed: scoring, validation, retrieval, static assets, and private-file isolation.');
  process.exit(0);
})().catch(error => { console.error(error); process.exitCode = 1; });
