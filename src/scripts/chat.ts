/**
 * Site chatbot. The widget talks to an n8n webhook (SITE.chatEndpoint) that holds the Anthropic API key
 * and calls the model; nothing secret ever reaches the browser.
 * Contract: POST { messages: [{role, content}], locale, page } → 200 { reply: string }.
 * When the reply ends with [[LEAD]] the widget opens an inline contact form, which posts to the
 * regular lead webhook with the same consent fields as the contact form.
 */
type Role = 'user' | 'assistant';
interface Msg { role: Role; content: string }
interface Saved { messages: Msg[]; open: boolean }

const STORE = 'idone-chat';
const ATTRIBUTION_STORE = 'idone-attribution';
const MAX_CHARS = 800;
const MAX_USER_TURNS = 20;
const SEND_WINDOW = 12;
const TIMEOUT_MS = 30000;
const LEAD_MARK = /\s*\[\[LEAD\]\]\s*/g;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{7,}$/;

function load(): Saved {
  try {
    const s = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    if (s && Array.isArray(s.messages)) return { messages: s.messages.filter((m: Msg) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'), open: !!s.open };
  } catch {}
  return { messages: [], open: false };
}
function save(s: Saved) { try { sessionStorage.setItem(STORE, JSON.stringify(s)); } catch {} }

/** Plain text → DOM with safe links for full URLs and site paths. Never uses innerHTML. */
function renderText(el: HTMLElement, text: string) {
  el.textContent = '';
  const clean = text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#{1,6}\s+/gm, '');
  const re = /(https?:\/\/[^\s)]+|\/(?:he|en)\/[a-z0-9\-/]*)/gi;
  let last = 0;
  for (const m of clean.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) el.append(clean.slice(last, i));
    const raw = m[0].replace(/[.,;:!?]+$/, '');
    const a = document.createElement('a');
    a.textContent = raw;
    try {
      const u = new URL(raw, location.origin);
      if (u.origin === location.origin) a.href = u.pathname + u.search + u.hash;
      else { a.href = u.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      el.append(a);
    } catch { el.append(raw); }
    el.append(m[0].slice(raw.length));
    last = i + m[0].length;
  }
  if (last < clean.length) el.append(clean.slice(last));
}

export function initChat() {
  const found = document.querySelector<HTMLElement>('[data-chat]');
  if (!found || found.dataset.bound) return;
  found.dataset.bound = '1';
  const root: HTMLElement = found;

  const d = root.dataset as Record<string, string>;
  const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const panel = q<HTMLElement>('.chat-panel');
  const launcher = q<HTMLButtonElement>('[data-chat-open]');
  const log = q<HTMLElement>('[data-chat-log]');
  const form = q<HTMLFormElement>('[data-chat-form]');
  const input = q<HTMLTextAreaElement>('[data-chat-input]');
  const sendBtn = q<HTMLButtonElement>('[data-chat-send]');
  const leadForm = q<HTMLFormElement>('[data-chat-lead]');
  const typingText = q<HTMLTemplateElement>('[data-typing]').content.textContent || '…';
  const suggestions: string[] = (() => { try { return JSON.parse(d.suggestions); } catch { return []; } })();

  const state = load();
  let busy = false;
  let chips: HTMLElement | null = null;

  const bubble = (kind: 'bot' | 'user' | 'note', text: string, extra = '') => {
    const el = document.createElement('div');
    el.className = `chat-msg chat-msg-${kind} ${extra}`.trim();
    renderText(el, text);
    log.append(el);
    log.scrollTop = log.scrollHeight;
    return el;
  };

  function setOpen(open: boolean, focus = true) {
    state.open = open; save(state);
    root.dataset.open = String(open);
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) { log.scrollTop = log.scrollHeight; if (focus) input.focus(); }
    else if (focus) launcher.focus();
  }

  function renderAll() {
    log.textContent = '';
    bubble('bot', d.welcome);
    state.messages.forEach((m) => bubble(m.role === 'user' ? 'user' : 'bot', m.content.replace(LEAD_MARK, '')));
    chips = null;
    if (!state.messages.length && suggestions.length) {
      chips = document.createElement('div');
      chips.className = 'chat-chips';
      suggestions.forEach((s) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'chat-chip'; b.textContent = s;
        b.addEventListener('click', () => send(s));
        chips!.append(b);
      });
      log.append(chips);
    }
  }

  function showLead(show: boolean) {
    leadForm.hidden = !show;
    root.dataset.lead = String(show);
    if (show) { leadForm.querySelector<HTMLInputElement>('input[name="name"]')?.focus(); log.scrollTop = log.scrollHeight; }
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    if (text.length > MAX_CHARS) { bubble('note', d.msgTooLong, 'chat-msg-error'); return; }
    if (state.messages.filter((m) => m.role === 'user').length >= MAX_USER_TURNS) { bubble('note', d.msgLimit, 'chat-msg-error'); return; }

    chips?.remove(); chips = null;
    busy = true; sendBtn.disabled = true;
    state.messages.push({ role: 'user', content: text }); save(state);
    bubble('user', text);
    input.value = ''; autosize();
    const typing = bubble('bot', typingText, 'chat-typing');

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      // the API wants the conversation to open with a user turn, so a window cut mid-conversation drops leading bot turns
      const windowed = state.messages.slice(-SEND_WINDOW);
      while (windowed.length && windowed[0].role !== 'user') windowed.shift();
      const res = await fetch(d.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
        body: JSON.stringify({ messages: windowed, locale: d.locale, page: location.pathname }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = typeof data?.reply === 'string' ? data.reply.trim() : '';
      if (!reply) throw new Error('empty reply');
      const wantsLead = /\[\[LEAD\]\]/.test(reply);
      const shown = reply.replace(LEAD_MARK, '').trim();
      state.messages.push({ role: 'assistant', content: shown }); save(state);
      typing.remove();
      bubble('bot', shown);
      if (wantsLead) showLead(true);
    } catch (err) {
      console.warn('[chat] failed', err);
      // drop the unanswered question so the history keeps alternating; give the text back to the visitor
      state.messages.pop(); save(state);
      typing.remove();
      log.querySelector('.chat-msg-user:last-of-type')?.remove();
      input.value = text; autosize();
      bubble('note', d.msgError, 'chat-msg-error');
    } finally {
      clearTimeout(timer);
      busy = false; sendBtn.disabled = false;
      if (state.open) input.focus();
    }
  }

  function autosize() { input.style.blockSize = 'auto'; input.style.blockSize = `${Math.min(input.scrollHeight, 120)}px`; }

  // ---- lead form
  function validate(el: HTMLInputElement): boolean {
    const wrap = el.closest<HTMLElement>('[data-field]');
    const err = wrap?.querySelector<HTMLElement>('.chat-err');
    const v = el.value.trim();
    let msg = '';
    if (el.required && !v) msg = d.msgRequired;
    else if (v && el.type === 'email' && !EMAIL.test(v)) msg = d.msgEmail;
    else if (v && el.type === 'tel' && !PHONE.test(v)) msg = d.msgPhone;
    if (wrap) wrap.dataset.invalid = msg ? 'true' : 'false';
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg;
    return !msg;
  }

  function attribution(): Record<string, string> {
    try { return JSON.parse(sessionStorage.getItem(ATTRIBUTION_STORE) || '{}') || {}; } catch { return {}; }
  }

  leadForm.querySelectorAll<HTMLInputElement>('[data-field] input').forEach((el) => {
    el.addEventListener('blur', () => validate(el));
  });
  leadForm.querySelector('[data-lead-cancel]')!.addEventListener('click', () => { showLead(false); input.focus(); });
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = Array.from(leadForm.querySelectorAll<HTMLInputElement>('[data-field] input'));
    if (!fields.map(validate).every(Boolean)) { fields.find((f) => f.getAttribute('aria-invalid') === 'true')?.focus(); return; }
    const get = (n: string) => (leadForm.elements.namedItem(n) as HTMLInputElement).value.trim();
    if (get('website')) { showLead(false); bubble('bot', d.leadSuccess); return; } // honeypot: pretend

    const btn = leadForm.querySelector<HTMLButtonElement>('[data-lead-submit]')!;
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = d.msgSending;
    const transcript = state.messages.map((m) => `${m.role === 'user' ? '>' : '<'} ${m.content}`).join('\n').slice(-1500);
    const payload = {
      name: get('name'), phone: get('phone'), email: get('email'),
      message: `[${d.leadFrom}]\n${transcript}`,
      locale: d.locale, source: 'website', page: location.pathname,
      consentWording: d.consent, privacyVersion: d.privacyVersion,
      marketingConsent: (leadForm.elements.namedItem('marketingConsent') as HTMLInputElement).checked,
      ...attribution(),
      submittedAt: new Date().toISOString(), userAgent: navigator.userAgent,
    };
    try {
      const res = await fetch(d.leadEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showLead(false); leadForm.reset();
      state.messages.push({ role: 'assistant', content: d.leadSuccess }); save(state);
      bubble('bot', d.leadSuccess);
    } catch (err) {
      console.warn('[chat] lead failed', err);
      bubble('note', d.msgError, 'chat-msg-error');
    } finally { btn.disabled = false; btn.textContent = label; }
  });

  // ---- wiring
  form.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(input.value); } });
  input.addEventListener('input', autosize);
  launcher.addEventListener('click', () => setOpen(true));
  q('[data-chat-close]').addEventListener('click', () => setOpen(false));
  q('[data-chat-reset]').addEventListener('click', () => {
    state.messages = []; save(state); showLead(false); renderAll(); input.focus();
  });
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.open) { e.stopPropagation(); setOpen(false); } });

  renderAll();
  setOpen(state.open, false);
}
