/**
 * Email preferences page (/preferences/?t=<contact token>).
 * GET  <endpoint>?t=&l=  → { ok, emailMarketing, fullBlock }   (n8n WF-03; anything else = invalid link)
 * POST <endpoint> JSON { t, locale, emailMarketing, stopAll, page, userAgent } → { ok }
 */
const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function initPreferences() {
  const root = document.querySelector<HTMLElement>('[data-prefs]');
  if (!root || root.dataset.bound) return;
  root.dataset.bound = '1';
  const endpoint = root.dataset.endpoint!;
  const locale = root.dataset.locale!;
  const form = root.querySelector<HTMLFormElement>('[data-prefs-form]')!;
  const email = form.elements.namedItem('emailMarketing') as HTMLInputElement;
  const stop = form.elements.namedItem('stopAll') as HTMLInputElement;
  const confirm = form.elements.namedItem('stopConfirm') as HTMLInputElement;
  const confirmBox = form.querySelector<HTMLElement>('[data-stop-confirm]')!;
  const show = (state: string) => { root.dataset.state = state; };

  const syncStop = () => {
    confirmBox.hidden = !stop.checked;
    if (!stop.checked) { confirm.checked = false; confirmBox.dataset.invalid = 'false'; }
    email.disabled = stop.checked;
  };
  stop.addEventListener('change', syncStop);
  confirm.addEventListener('change', () => { confirmBox.dataset.invalid = 'false'; });

  const token = (new URLSearchParams(location.search).get('t') || '').trim();
  if (!TOKEN.test(token)) { show('invalid'); return; }

  show('loading');
  fetch(`${endpoint}?t=${encodeURIComponent(token)}&l=${locale}`, { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((d) => {
      if (!d || d.ok !== true) { show('invalid'); return; }
      email.checked = !!d.emailMarketing;
      stop.checked = !!d.fullBlock;
      syncStop();
      confirm.checked = stop.checked;
      show('ready');
    })
    .catch((err) => { console.warn('[preferences] load failed', err); show('invalid'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (stop.checked && !confirm.checked) { confirmBox.dataset.invalid = 'true'; confirm.focus(); return; }
    const btn = form.querySelector<HTMLButtonElement>('[data-submit]')!;
    const label = btn.querySelector<HTMLElement>('[data-submit-label]')!;
    const original = label.textContent;
    btn.disabled = true;
    label.textContent = btn.dataset.saving || '…';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: token, locale, emailMarketing: !stop.checked && email.checked, stopAll: stop.checked, page: location.pathname, userAgent: navigator.userAgent }),
      });
      const d = res.ok ? await res.json().catch(() => ({})) : null;
      if (!d || d.ok !== true) throw new Error(`HTTP ${res.status}`);
      show('saved');
    } catch (err) {
      console.warn('[preferences] save failed', err);
      show('error');
    } finally {
      btn.disabled = false;
      label.textContent = original;
    }
  });
}
