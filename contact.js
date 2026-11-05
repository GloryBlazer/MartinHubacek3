'use strict';
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');
let sending = false;
contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || !contactForm.reportValidity()) return;
  const values = new FormData(contactForm);
  const payload = Object.fromEntries(['name', 'email', 'subject', 'message'].map(key => [key, values.get(key).trim()]));
  if (Object.values(payload).some(value => !value)) {
    contactStatus.textContent = 'Vyplňte prosím všechna pole.';
    return;
  }
  sending = true;
  const button = contactForm.querySelector('button');
  button.disabled = true;
  contactForm.setAttribute('aria-busy', 'true');
  contactStatus.textContent = 'Ukládání zprávy…';
  try {
    const response = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (response.status === 429) throw new Error('Příliš mnoho zpráv. Zkuste to za minutu.');
    if (response.status === 400) throw new Error('Zkontrolujte e-mail a délku vyplněných polí.');
    if (!response.ok) throw new Error('Zprávu se nepodařilo uložit. Zkuste to znovu nebo napište e-mail.');
    const receipt = await response.json();
    // Keep any edits made while the request was in flight.
    const unchanged = Object.keys(payload).every(key => contactForm.elements.namedItem(key).value.trim() === payload[key]);
    if (unchanged) contactForm.reset();
    contactStatus.textContent = receipt.message;
  } catch (error) {
    contactStatus.textContent = error instanceof TypeError
      ? 'Server není dostupný. Zkuste to znovu nebo napište e-mail.'
      : error.message;
  } finally {
    sending = false;
    button.disabled = false;
    contactForm.removeAttribute('aria-busy');
  }
});
