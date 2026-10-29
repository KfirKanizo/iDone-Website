/**
 * Contact form: client validation, JSON POST to the n8n webhook, success/error states.
 * Success dispatches `form:success` so the CTA scene can land the dot in the D.
 * Without JavaScript the form posts natively to the same endpoint.
 */
const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'ref'];
const ATTRIBUTION_STORE = 'idone-attribution';

/** UTM and ?ref= from the landing URL, kept for the visit so a form on a later page still sends them. First value wins. */
function attribution(): Record<string, string> {
  let saved: Record<string, string> = {};
  try { saved = JSON.parse(sessionStorage.getItem(ATTRIBUTION_STORE) || '{}') || {}; } catch {}
  const params = new URLSearchParams(location.search);
  let changed = false;
  ATTRIBUTION_KEYS.forEach((k) => {
    const v = (params.get(k) || '').trim().slice(0, 200);
    if (v && !saved[k]) { saved[k] = v; changed = true; }
  });
  if (changed) { try { sessionStorage.setItem(ATTRIBUTION_STORE, JSON.stringify(saved)); } catch {} }
  return saved;
}

export function initForms() {
  const attr = attribution();
  document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
    if (form.dataset.bound) return;
    form.dataset.bound = '1';
    // hidden inputs filled from the URL, e.g. ?lead=rec… or ?t=… on the assessment page
    const params = new URLSearchParams(location.search);
    form.querySelectorAll<HTMLInputElement>('input[data-query]').forEach((el) => { el.value = params.get(el.dataset.query!) || ''; });
    form.querySelectorAll<HTMLInputElement>('input[data-attribution]').forEach((el) => { el.value = attr[el.dataset.attribution!] || ''; });
    form.addEventListener('submit', (e) => { e.preventDefault(); submit(form); });
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach((el) => {
      el.addEventListener('blur', () => validateField(form, el));
      el.addEventListener('input', () => { if (el.closest<HTMLElement>('[data-field]')?.dataset.invalid === 'true') validateField(form, el); });
    });
  });
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{7,}$/;

function validateField(form: HTMLFormElement, el: HTMLInputElement | HTMLTextAreaElement): boolean {
  const wrap = el.closest<HTMLElement>('[data-field]');
  if (!wrap) return true;
  const err = wrap.querySelector<HTMLElement>('.error');
  let msg = '';
  const v = el.value.trim();
  if (el.required && !v) msg = form.dataset.msgRequired!;
  else if (v && el.type === 'email' && !EMAIL.test(v)) msg = form.dataset.msgEmail!;
  else if (v && el.type === 'tel' && !PHONE.test(v)) msg = form.dataset.msgPhone!;
  wrap.dataset.invalid = msg ? 'true' : 'false';
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (err) err.textContent = msg;
  return !msg;
}

function setStatus(form: HTMLFormElement, kind: 'success' | 'error') {
  const tpl = form.querySelector<HTMLTemplateElement>(kind === 'success' ? '[data-success]' : '[data-error]')!;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  status.querySelector<HTMLElement>('[data-status-title]')!.textContent = tpl.content.querySelector('[data-title]')!.textContent;
  status.querySelector<HTMLElement>('[data-status-text]')!.textContent = tpl.content.querySelector('[data-text]')!.textContent;
  status.hidden = false;
  form.dataset.state = kind;
  if (kind === 'success') form.classList.add('is-done');
}

async function submit(form: HTMLFormElement) {
  const fields = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-field] input, [data-field] textarea'));
  const ok = fields.map((f) => validateField(form, f)).every(Boolean);
  if (!ok) { fields.find((f) => f.getAttribute('aria-invalid') === 'true')?.focus(); return; }
  if ((form.elements.namedItem('website') as HTMLInputElement)?.value) { setStatus(form, 'success'); return; } // honeypot: pretend

  const btn = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const label = btn.querySelector<HTMLElement>('[data-submit-label]')!;
  const original = label.textContent;
  btn.disabled = true;
  label.textContent = form.dataset.msgSending || '…';
  // real waiting state → the brand loader
  const loader = document.createElement('idone-logo');
  loader.setAttribute('layout', 'mark'); loader.setAttribute('animation', 'loop'); loader.setAttribute('theme', 'inherit');
  loader.setAttribute('aria-hidden', 'true'); loader.style.cssText = 'width:20px;height:20px;--idone-ink:currentColor;--idone-accent:currentColor';
  btn.prepend(loader);

  const fd = new FormData(form);
  const payload: Record<string, unknown> = {};
  const isBool = (k: string) => !!form.querySelector(`input[type="checkbox"][name="${k}"][data-bool]`);
  const isList = (k: string) => !isBool(k) && !!form.querySelector(`input[type="checkbox"][name="${k}"]`);
  fd.forEach((v, k) => {
    if (k === 'website' || isBool(k)) return;
    if (isList(k)) { ((payload[k] ||= []) as string[]).push(String(v)); }
    else payload[k] = String(v);
  });
  // single yes/no checkboxes (e.g. marketingConsent) are sent as true/false, never omitted
  form.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-bool]').forEach((el) => { payload[el.name] = el.checked; });
  payload.submittedAt = new Date().toISOString();
  payload.userAgent = navigator.userAgent;

  try {
    const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setStatus(form, 'success');
    form.dispatchEvent(new CustomEvent('form:success', { bubbles: true }));
  } catch (err) {
    console.warn('[contact] submit failed', err);
    setStatus(form, 'error');
  } finally {
    loader.remove();
    btn.disabled = false;
    label.textContent = original;
  }
}
