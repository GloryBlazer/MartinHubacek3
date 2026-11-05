'use strict';
const api = '/api/questionnaire';
async function requestJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    if (response.status === 404) throw new Error('Výsledek nebyl nalezen. Vyplňte dotazník znovu.');
    if (response.status === 429) throw new Error('Příliš mnoho požadavků. Zkuste to za minutu.');
    throw new Error('Požadavek se nepodařilo dokončit. Zkuste to znovu.');
  }
  return response.json();
}
function showMessage(target, message) {
  const paragraph = document.createElement('p');
  paragraph.textContent = message;
  target.replaceChildren(paragraph);
}
async function initializeForm() {
  const form = document.getElementById('questionnaire');
  if (!form) return;
  const container = document.getElementById('questions');
  const status = document.getElementById('progress');
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  status.textContent = 'Načítání otázek…';
  let definition;
  try {
    definition = await requestJson(api);
  } catch {
    status.textContent = 'Dotazník potřebuje běžící backend. Otevření HTML souboru ani statický server na portu 8000 nestačí. ';
    const backendLink = document.createElement('a');
    backendLink.href = 'http://127.0.0.1:5080/js_projekt/Questionaire.html';
    backendLink.textContent = 'Otevřít dotazník na lokálním backendu';
    status.append(backendLink);
    return;
  }
  definition.questions.forEach((question, index) => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = `${index + 1}. ${question.text}`;
    const choices = document.createElement('div');
    choices.className = 'choices';
    for (let value = definition.minValue; value <= definition.maxValue; value++) {
      const label = document.createElement('label');
      label.className = 'choice';
      const input = document.createElement('input');
      input.type = 'radio'; input.name = question.id; input.value = String(value); input.required = true;
      label.append(input, document.createTextNode(String(value))); choices.append(label);
    }
    const scale = document.createElement('p');
    scale.className = 'scale'; scale.textContent = '1 = vůbec nesouhlasím · 5 = zcela souhlasím';
    fieldset.append(legend, choices, scale); container.append(fieldset);
  });
  const updateProgress = () => {
    status.textContent = `Zodpovězeno ${form.querySelectorAll('input:checked').length} z ${definition.questions.length} otázek`;
  };
  form.addEventListener('change', updateProgress);
  form.addEventListener('reset', () => setTimeout(updateProgress, 0));
  window.addEventListener('pageshow', updateProgress);
  let pending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    const data = new FormData(form);
    const answers = Object.fromEntries(definition.questions.map(question => [question.id, Number(data.get(question.id))]));
    pending = true;
    submit.disabled = true;
    form.querySelector('button[type="reset"]').disabled = true;
    status.textContent = 'Odesílání odpovědí…';
    try {
      const result = await requestJson(`${api}/submissions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers })
      });
      const url = new URL('answer.html', window.location.href);
      url.hash = new URLSearchParams({ id: result.id }).toString();
      window.location.assign(url.href);
    } catch (error) {
      status.textContent = error.message;
    } finally {
      pending = false;
      submit.disabled = false;
      form.querySelector('button[type="reset"]').disabled = false;
    }
  });
  submit.disabled = false;
  updateProgress();
}
async function initializeResult() {
  const result = document.getElementById('result');
  if (!result) return;
  let revision = 0;
  const render = async () => {
    const currentRevision = ++revision;
    const id = new URLSearchParams(window.location.hash.slice(1)).get('id');
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      showMessage(result, 'Nejprve vyplňte všech pět otázek.'); return;
    }
    showMessage(result, 'Načítání výsledku…');
    try {
      const evaluation = await requestJson(`${api}/submissions/${encodeURIComponent(id)}`);
      if (currentRevision !== revision) return;
      result.replaceChildren();
      const score = document.createElement('p'); score.className = 'score'; score.textContent = `${evaluation.score} / ${evaluation.maxScore} bodů`;
      const description = document.createElement('p'); description.textContent = evaluation.description;
      const heading = document.createElement('h2'); heading.textContent = 'Vaše odpovědi';
      const list = document.createElement('ol'); list.className = 'answer-list';
      evaluation.answers.forEach(answer => {
        const item = document.createElement('li'); item.textContent = `${answer.question} — ${answer.value} / 5`; list.append(item);
      });
      result.append(score, description, heading, list);
    } catch (error) {
      if (currentRevision === revision) showMessage(result, error.message);
    }
  };
  window.addEventListener('hashchange', render);
  await render();
}
initializeForm();
initializeResult();
