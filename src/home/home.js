/* =====================================================================
   iDone Technologies — homepage (/he/, /en/)
   Markup: src/home/home.html · copy: src/home/dict.js · styles: src/home/home.css
   Page facts (endpoints, reel files, other-language URL) come from #home-config,
   written by HomePage.astro from src/lib/site.ts.
   The site chatbot (src/scripts/chat.ts) is mounted by the page, not here.
   ===================================================================== */
import { DICT } from "./dict.js";
import { gsap as gsapLib } from "gsap";
import { ScrollTrigger as ScrollTriggerLib } from "gsap/ScrollTrigger";
import { CustomEase as CustomEaseLib } from "gsap/CustomEase";
import LenisLib from "lenis";
import { initChat as initSiteChat } from "../scripts/chat";
import { attribution } from "../scripts/form";

/* UTM and ?ref= for this visit (shared with the forms on every other page). */
const ATTRIBUTION = attribution();

const CONFIG = JSON.parse(document.getElementById("home-config")?.textContent || "{}");
const FORM_ENDPOINT = CONFIG.formEndpoint || "https://n8n.idone.co.il/webhook/website-form-v2";
/* Reel files per [data-reel]. While empty, a reel shows its drawn poster. */
const MEDIA = CONFIG.media || {};
/* Live sites of our own products: the single source for every [data-site] link. */
const SITES = { midda: "https://midda.idone.co.il/", boostcoach: "https://fit.idone.co.il/#/landing" };
const HEADER_H = 72;
const LEAP = 0.72;


/* ---------- helpers ---------- */
const root = document.documentElement;
root.classList.add("js");
const q = (s, c = document) => c.querySelector(s);
const qa = (s, c = document) => [...c.querySelectorAll(s)];
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
const sess = { get(k) { try { return sessionStorage.getItem(k); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch {} }, del(k) { try { sessionStorage.removeItem(k); } catch {} } };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function offsetWithin(el, anc) { let x = 0, y = 0, n = el; while (n && n !== anc) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x, y }; }

const mqDesktop = matchMedia("(min-width:900px)");
const mqHover = matchMedia("(hover:hover) and (min-width:900px)");
const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
const mqDark = matchMedia("(prefers-color-scheme: dark)");
const lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.connection && navigator.connection.saveData);

/* ---------- state ---------- */
let lang = root.lang === "en" ? "en" : "he";
if (!DICT[lang]) lang = "he";
let theme = store.get("idone-theme") || (mqDark.matches ? "dark" : "light");
let motionPref = store.get("idone-motion");
const isReduced = () => (motionPref ? motionPref === "reduced" : (mqReduce.matches || !!lowEnd));
let sent = false;

let gsap = null, ScrollTrigger = null, CustomEase = null, Lenis = null;
let lenis = null, mm = null, introTl = null, introDone = false, introJust = false;
const introCbs = [];
const motion = { dot: null, ctaLeap: null };

root.dataset.theme = theme;
root.dataset.motion = isReduced() ? "reduced" : "full";
const willIntro = !isReduced() && !sess.get("idone-intro") && window.scrollY < 40;
if (willIntro) root.classList.add("intro-pending", "intro-running");

/* ---------- i18n ---------- */
const t = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), DICT[lang]);
function applyI18n() {
  root.lang = lang; root.dir = lang === "he" ? "rtl" : "ltr";
  document.title = t("meta.title");
  const md = q('meta[name="description"]'); if (md) md.setAttribute("content", t("meta.description"));
  qa("[data-i18n]").forEach((el) => { const k = el.dataset.i18n; if (!k) return; const v = t(k); if (typeof v === "string") el.textContent = v; });
  qa("[data-i18n-attr]").forEach((el) => el.dataset.i18nAttr.split(";").forEach((pair) => {
    const i = pair.indexOf(":"); if (i < 0) return; const v = t(pair.slice(i + 1).trim()); if (typeof v === "string") el.setAttribute(pair.slice(0, i).trim(), v);
  }));
  syncLabels();
}
function syncLabels() {
  const other = lang === "he" ? "en" : "he";
  const ls = q(".lang-switch"); ls.setAttribute("hreflang", other); ls.setAttribute("lang", other);
  q("#theme-toggle").setAttribute("aria-label", t(theme === "dark" ? "a11y.themeLight" : "a11y.themeDark"));
  const mt = q("#motion-toggle"); mt.setAttribute("aria-label", t(isReduced() ? "a11y.motionOn" : "a11y.motionOff")); mt.setAttribute("aria-pressed", String(isReduced()));
  const nt = q("#nav-toggle"); nt.setAttribute("aria-label", t(nt.getAttribute("aria-expanded") === "true" ? "a11y.menuClose" : "a11y.menuOpen"));
  qa(".reel[data-reel]").forEach((reel) => { const b = q(".play-btn", reel), on = reel.classList.contains("is-playing");
    b.setAttribute("aria-label", t(on ? "a11y.pauseReel" : "a11y.playReel") + " · " + q(".reel-title", reel).textContent); b.setAttribute("aria-pressed", String(on)); });
}

/* ---------- scrolling ---------- */
function scrollToEl(el, immediate) {
  const off = -(parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
  if (lenis) lenis.scrollTo(el, { offset: off, immediate: !!immediate, duration: 1, force: true });
  else { const y = el.getBoundingClientRect().top + window.scrollY + off; window.scrollTo({ top: y, behavior: immediate || isReduced() ? "auto" : "smooth" }); }
}
function scrollToY(y) { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); }
function captureScene() {
  const secs = qa("main > section"); let cur = secs[0];
  for (const s of secs) if (s.getBoundingClientRect().top <= innerHeight * 0.5) cur = s;
  const r = cur.getBoundingClientRect();
  return { el: cur, frac: clamp(-r.top / Math.max(1, r.height), 0, 1), atTop: window.scrollY < 4 };
}
function restoreScene(k) {
  if (!k || k.atTop) { scrollToY(0); return; }
  const r = k.el.getBoundingClientRect();
  scrollToY(Math.max(0, r.top + window.scrollY + k.frac * r.height));
}

/* ---------- header / nav / toggles ---------- */
function initHeader() {
  const header = q(".site-header"), nav = q("#site-nav"), nt = q("#nav-toggle"), menu = q(".menu");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const closeNav = () => { nav.classList.remove("is-open"); nt.setAttribute("aria-expanded", "false"); nt.setAttribute("aria-label", t("a11y.menuOpen")); };
  nt.addEventListener("click", () => { const open = !nav.classList.contains("is-open"); nav.classList.toggle("is-open", open); nt.setAttribute("aria-expanded", String(open)); nt.setAttribute("aria-label", t(open ? "a11y.menuClose" : "a11y.menuOpen")); });
  document.addEventListener("click", (e) => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  document.addEventListener("keydown", (e) => { if (e.key !== "Escape") return; if (menu.open) { menu.open = false; q("summary", menu).focus(); } if (nav.classList.contains("is-open")) { closeNav(); nt.focus(); } });
  mqDesktop.addEventListener("change", closeNav);

  /* in-page anchors */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute("href").slice(1); const el = id ? document.getElementById(id) : null;
    if (!el) { e.preventDefault(); return; }
    e.preventDefault(); menu.open = false; closeNav(); scrollToEl(el);
    if (el.hasAttribute("tabindex")) el.focus({ preventScroll: true });
    try { history.replaceState(null, "", "#" + id); } catch {}
  });

  /* language */
  q(".lang-switch").addEventListener("click", () => { store.set("idone-lang", lang === "he" ? "en" : "he"); });
  /* theme */
  q("#theme-toggle").addEventListener("click", () => { theme = theme === "dark" ? "light" : "dark"; store.set("idone-theme", theme); root.dataset.theme = theme; syncLabels(); if (motion.dot) motion.dot.recolor(); });
  mqDark.addEventListener("change", (e) => { if (store.get("idone-theme")) return; theme = e.matches ? "dark" : "light"; root.dataset.theme = theme; syncLabels(); });
  /* motion */
  q("#motion-toggle").addEventListener("click", () => setMotion(isReduced() ? "full" : "reduced"));

  /* aria-current for the section in view */
  const links = qa("[data-nav]", nav);
  const spy = new IntersectionObserver((es) => es.forEach((en) => { const l = links.find((x) => x.dataset.nav === en.target.id); if (!l) return; if (en.isIntersecting) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current"); }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((l) => { const s = document.getElementById(l.dataset.nav); if (s) spy.observe(s); });
  q("#year").textContent = new Date().getFullYear();
}

function setMotion(pref) {
  const keep = captureScene();
  motionPref = pref; store.set("idone-motion", pref);
  root.dataset.motion = isReduced() ? "reduced" : "full";
  let ready = null;
  if (isReduced()) stopMotion(); else ready = startMotion(false);
  syncLabels(); drawLinks();
  if (ready) ready.then(() => { restoreScene(keep); if (ScrollTrigger) ScrollTrigger.update(); }); else restoreScene(keep);
}

/* ---------- reveals ---------- */
function initReveals() {
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { threshold: 0.15 });
  qa(".reveal").forEach((el) => io.observe(el));
}

/* ---------- one-table links (also used without motion) ---------- */
function drawLinks() {
  const desk = q("[data-desk]"); if (!desk) return;
  const svg = q("[data-links]", desk), W = desk.clientWidth, H = desk.clientHeight; if (!W || !H) return;
  const dr = desk.getBoundingClientRect();
  const c = qa("[data-station]", desk).map((el) => { const b = el.getBoundingClientRect(); return [b.left + b.width / 2 - dr.left, b.top + b.height / 2 - dr.top]; });
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  qa("[data-link]", svg).forEach((p, i) => p.setAttribute("d", "M" + c[i][0].toFixed(1) + " " + c[i][1].toFixed(1) + "L" + c[i + 1][0].toFixed(1) + " " + c[i + 1][1].toFixed(1)));
}

/* ---------- reels ---------- */
function loadReel(reel) { const v = q("video", reel); if (!v || v.getAttribute("src") || !v.dataset.src) return; v.src = v.dataset.src; reel.classList.add("has-video"); }
function setPlaying(reel, on, user) {
  const v = q("video", reel), btn = q(".play-btn", reel); if (!btn) return;
  if (on) {
    if (user) qa(".reel.is-playing").forEach((r) => { if (r !== reel) setPlaying(r, false, true); });
    loadReel(reel);
    if (v && v.getAttribute("src")) { if (user) v.muted = false; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
  } else if (v && v.getAttribute("src")) v.pause();
  reel.classList.toggle("is-playing", on);
  if (user) reel.dataset.user = on ? "1" : "";
  btn.setAttribute("aria-pressed", String(on));
  btn.setAttribute("aria-label", t(on ? "a11y.pauseReel" : "a11y.playReel") + " · " + q(".reel-title", reel).textContent);
}
function initReels() {
  const reels = qa(".reel[data-reel]");
  reels.forEach((reel) => {
    const v = q("video", reel); if (v && MEDIA[reel.dataset.reel]) v.dataset.src = MEDIA[reel.dataset.reel];
    q(".play-btn", reel).addEventListener("click", () => setPlaying(reel, !reel.classList.contains("is-playing"), true));
  });
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) loadReel(en.target); else if (en.target.classList.contains("is-playing")) setPlaying(en.target, false, false); }), { threshold: 0.1 });
  reels.forEach((r) => io.observe(r));
}

/* ---------- logo tap ---------- */
function tap(el) {
  if (!gsap || isReduced() || !el) return;
  const d = q(".lg-d", el), c = q(".lg-dot", el); if (!d || !c) return;
  gsap.timeline()
    .fromTo(c, { scaleX: 1.25, scaleY: 0.8, transformOrigin: "50% 50%" }, { scaleX: 1, scaleY: 1, duration: 0.3, ease: "idone.back" }, 0)
    .fromTo(d, { scale: 1, transformOrigin: "50% 50%" }, { scale: 1.04, duration: 0.08, ease: "idone.out" }, 0)
    .to(d, { scale: 1, duration: 0.22, ease: "idone.back" });
}

/* ---------- contact form ---------- */
function closeCta(animated) {
  sent = true; sess.set("idone-form-sent", "1");
  const sec = q("#contact"), mark = q("#cta-mark");
  sec.classList.add("is-sent");
  let closed = false;
  const fin = () => { if (closed) return; closed = true; sec.classList.add("is-closed"); mark.classList.add("is-landed"); if (animated) { tap(mark); tap(q(".site-header .logo")); } };
  if (animated && motion.ctaLeap) { scrollToEl(sec); motion.ctaLeap(mark, fin); setTimeout(fin, 1500); /* never leave the block open if the dot is called away */ }
  else { if (animated) scrollToEl(sec); fin(); }
}
function initForm() {
  const form = q("#contact-form"); form.noValidate = true;
  const names = ["name", "email", "phone"];
  const rules = {
    name: (v) => (v.trim() ? null : "required"),
    email: (v) => (!v.trim() ? "required" : (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : "invalidEmail")),
    phone: (v) => { const s = v.trim(); if (!s) return "required"; const d = s.replace(/\D/g, ""); return /^[+\d][\d\s\-().]*$/.test(s) && d.length >= 9 && d.length <= 15 ? null : "invalidPhone"; }
  };
  const check = (n) => {
    const input = form.elements[n], err = rules[n](input.value), box = q("#err-" + n);
    input.setAttribute("aria-invalid", err ? "true" : "false");
    if (err) { box.dataset.i18n = "form." + err; box.textContent = t("form." + err); } else { box.dataset.i18n = ""; box.textContent = ""; }
    return !err;
  };
  names.forEach((n) => { const input = form.elements[n]; input.addEventListener("blur", () => { if (input.value || input.getAttribute("aria-invalid") === "true") check(n); }); input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") check(n); }); });
  const btn = q("#form-submit"), label = q("#form-submit-label"), errBox = q("#form-error");
  const sending = (on) => { btn.disabled = on; label.dataset.i18n = on ? "form.sending" : "form.submit"; label.textContent = t(label.dataset.i18n); };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ok = names.map(check);
    if (ok.includes(false)) { form.elements[names[ok.indexOf(false)]].focus(); return; }
    errBox.hidden = true;
    if (form.elements.website.value) { document.dispatchEvent(new CustomEvent("form:success")); return; }
    sending(true);
    const need = form.elements.need.value;
    const payload = { name: form.elements.name.value.trim(), phone: form.elements.phone.value.trim(), email: form.elements.email.value.trim(), need: need ? [need] : [],
      message: form.elements.message.value.trim(), locale: lang, source: "website", page: location.pathname, submittedAt: new Date().toISOString(), userAgent: navigator.userAgent,
      marketingConsent: form.elements.marketingConsent.checked,
      consentWording: t("form.consent"), privacyVersion: CONFIG.privacyVersion || "", ...ATTRIBUTION };
    try {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("HTTP " + res.status);
      document.dispatchEvent(new CustomEvent("form:success"));
    } catch (err) { errBox.hidden = false; errBox.scrollIntoView({ block: "nearest" }); }
    finally { sending(false); }
  });
  document.addEventListener("form:success", () => closeCta(true));
  if (sess.get("idone-form-sent")) closeCta(false);
}

/* =====================================================================
   core boot (works with or without the motion libraries)
   ===================================================================== */
qa("[data-site]").forEach((a) => { const url = SITES[a.dataset.site]; if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; } });
initHeader();
initReveals();
initReels();
initForm();
initSiteChat();
applyI18n();
drawLinks();
window.addEventListener("resize", drawLinks);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawLinks);

/* =====================================================================
   motion libraries (optional: the page is complete without them)
   ===================================================================== */
{
  gsap = gsapLib;
  ScrollTrigger = ScrollTriggerLib;
  CustomEase = CustomEaseLib;
  Lenis = LenisLib;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("idone.out", "0.33,1,0.68,1");
  CustomEase.create("idone.inOut", "0.65,0,0.35,1");
  CustomEase.create("idone.back", "0.34,1.56,0.64,1");
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/* ---------- the travelling dot ---------- */
class DotController {
  constructor(el) {
    this.el = el; this.slot = null; this.x = 0; this.y = 0; this.s = 1; this.sx = 1; this.sy = 1;
    this.shown = false; this.docked = false; this.leap = null; this.sq = null; this.alive = true;
    this.measure = this.measure.bind(this); this.tick = this.tick.bind(this);
    this.measure(); window.addEventListener("resize", this.measure);
    gsap.ticker.add(this.tick);
    root.classList.add("dot-live");
  }
  measure() { this.size = this.el.offsetWidth || 16; const prev = this.el.style.transform; this.el.style.transform = "none"; this.ox = this.el.getBoundingClientRect().left; this.el.style.transform = prev; }
  destroy() { this.alive = false; gsap.ticker.remove(this.tick); window.removeEventListener("resize", this.measure); this.kill(); if (this.docked) this.undock(true); this.show(false); this.el.style.transform = ""; this.el.style.backgroundColor = ""; root.classList.remove("dot-live"); }
  target(slot) { return slot.querySelector(".dot-local") || slot; }
  centerOf(slot) { const r = this.target(slot).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }
  scaleFor(slot, c) { const v = slot.dataset.dotScale; if (v === "fit") return Math.max(0.2, c.w / this.size); return parseFloat(v) || 1; }
  recolor() { if (!this.slot) return; const c = getComputedStyle(this.slot).getPropertyValue("--accent").trim(); if (c) this.el.style.backgroundColor = c; }
  render() { this.el.style.transform = "translate3d(" + (this.x - this.size / 2 - this.ox) + "px," + (this.y - this.size / 2) + "px,0) scale(" + this.s * this.sx + "," + this.s * this.sy + ")"; }
  show(v) { this.shown = v; this.el.style.opacity = v ? "1" : "0"; }
  kill() { if (this.leap) { this.leap.kill(); this.leap = null; } if (this.sq) { this.sq.kill(); this.sq = null; } this.sx = this.sy = 1; }
  undock(silent) {
    if (!this.docked) return; const s = this.slot, c = this.centerOf(s);
    this.x = c.x; this.y = c.y; this.s = this.scaleFor(s, c); this.docked = false; s.classList.remove("is-docked");
    if (!silent) { this.show(true); this.render(); }
    s.dispatchEvent(new CustomEvent("dot:undocked", { bubbles: true }));
  }
  dock() {
    const s = this.slot; if (!s || !s.hasAttribute("data-dot-handoff")) return false;
    this.docked = true; s.classList.add("is-docked"); this.show(false);
    s.dispatchEvent(new CustomEvent("dot:docked", { bubbles: true })); return true;
  }
  land() { if (this.dock()) return; this.sx = 1.25; this.sy = 0.8; this.sq = gsap.to(this, { sx: 1, sy: 1, duration: 0.42, ease: "idone.back" }); }
  moveTo(slot, opts = {}) {
    if (!slot || !this.alive) return;
    if (slot === this.slot && (this.shown || this.docked)) return;
    this.kill(); this.undock();
    this.slot = slot; this.recolor();
    if (!this.shown) { this.appearAt(slot, opts.from); return; }
    this._leapTo(slot, opts.onDone);
  }
  _leapTo(slot, done) {
    const from = { x: this.x, y: this.y, s: this.s }, st = { t: 0 };
    this.leap = gsap.to(st, { t: 1, duration: LEAP, ease: "idone.inOut",
      onUpdate: () => {
        const c = this.centerOf(slot), to = this.scaleFor(slot, c), k = st.t, u = 1 - k;
        const d = Math.hypot(c.x - from.x, c.y - from.y), lift = Math.min(180, 40 + d * 0.3);
        const mx = (from.x + c.x) / 2, my = Math.min(from.y, c.y) - lift;
        this.x = u * u * from.x + 2 * u * k * mx + k * k * c.x;
        this.y = u * u * from.y + 2 * u * k * my + k * k * c.y;
        this.s = from.s + (to - from.s) * k; this.render();
      },
      onComplete: () => { this.leap = null; if (done) done(); else this.land(); } });
  }
  appearAt(slot, from) {
    this.kill(); if (this.docked) this.undock(true);
    this.slot = slot; this.recolor();
    if (from) { this.x = from.x; this.y = from.y; this.s = from.s || 1; this.show(true); this.render(); this._leapTo(slot); return; }
    const c = this.centerOf(slot), to = this.scaleFor(slot, c);
    this.x = c.x; this.y = c.y; this.s = 0.001; this.render(); this.show(true);
    this.leap = gsap.to(this, { s: to, duration: 0.42, ease: "idone.back",
      onUpdate: () => { const c2 = this.centerOf(slot); this.x = c2.x; this.y = c2.y; this.render(); },
      onComplete: () => { this.leap = null; this.dock(); } });
  }
  leapAndVanish(slot, cb) {
    if (!slot || !this.alive) { if (cb) cb(); return; }
    if (slot === this.slot && this.docked) { if (cb) cb(); return; }
    this.kill(); this.undock();
    this.slot = slot; this.recolor();
    if (!this.shown) { this.dock(); if (cb) cb(); return; }
    this._leapTo(slot, () => { if (!this.dock()) this.show(false); if (cb) cb(); });
  }
  tick() {
    if (!this.shown || this.leap || this.docked || !this.slot) return;
    const c = this.centerOf(this.slot); this.x = c.x; this.y = c.y; this.s = this.scaleFor(this.slot, c); this.render();
  }
}

/* ---------- logo intro (1.9 s, once per visit) ---------- */
function whenIntroDone(fn) { if (introDone) fn(); else introCbs.push(fn); }
function introLanded() { root.classList.remove("intro-running"); document.dispatchEvent(new CustomEvent("idone:landed")); }
function introFinish() {
  if (introDone) return;
  root.classList.remove("intro-playing", "intro-running", "intro-pending");
  sess.set("idone-intro", "1"); introDone = true; introJust = true;
  ["wheel", "touchmove", "click"].forEach((ev) => window.removeEventListener(ev, introSkip));
  window.removeEventListener("keydown", introKey);
  document.dispatchEvent(new CustomEvent("idone:finished"));
  introCbs.splice(0).forEach((fn) => fn());
}
function introSkip() { if (introTl && introTl.progress() < 1) introTl.progress(1); }
function introKey(e) { if (e.key === "Escape") introSkip(); }
function playIntro() {
  const lg = q("#hero-logo"), spine = q(".lg-spine", lg), bowl = q(".lg-bowl", lg), d = q(".lg-d", lg), dotc = q(".lg-dot", lg);
  const chars = qa(".ch", lg), idot = q(".i-dot", lg), tech = q(".tech", lg);
  const P0 = { x: -16, y: -20 }, P1 = { x: -8, y: -46 }, arc = { t: 0 };
  gsap.set(bowl, { strokeDasharray: 1, strokeDashoffset: 1 });
  introTl = gsap.timeline({ defaults: { ease: "idone.out" }, onComplete: introFinish });
  introTl
    .fromTo(spine, { attr: { y: 54, height: 0 } }, { attr: { y: 24, height: 30 }, duration: 0.3 }, 0)
    .fromTo(dotc, { x: P0.x, y: P0.y, scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.25, ease: "idone.back" }, 0.25)
    .to(bowl, { strokeDashoffset: 0, duration: 0.55, ease: "idone.inOut" }, 0.55)
    .to(spine, { attr: { y: 10, height: 44 }, duration: 0.3, ease: "idone.inOut" }, 0.7)
    .to(arc, { t: 1, duration: 0.42, ease: "idone.inOut", onUpdate() { const k = arc.t, u = 1 - k; gsap.set(dotc, { x: u * u * P0.x + 2 * u * k * P1.x, y: u * u * P0.y + 2 * u * k * P1.y }); } }, 0.6)
    .fromTo(dotc, { scaleX: 1.25, scaleY: 0.8 }, { scaleX: 1, scaleY: 1, duration: 0.3, ease: "idone.back", immediateRender: false }, 1.02)
    .add(introLanded, 1.1)
    .to(d, { scale: 1.04, duration: 0.08, transformOrigin: "50% 50%" }, 1.1)
    .to(d, { scale: 1, duration: 0.22, ease: "idone.back" }, 1.18)
    .from(chars, { y: 12, autoAlpha: 0, duration: 0.35, stagger: 0.06 }, 1.15)
    .from(idot, { yPercent: -40, autoAlpha: 0, duration: 0.3, ease: "idone.back" }, 1.55)
    .from(tech, { autoAlpha: 0, duration: 0.25 }, 1.65);
  root.classList.remove("intro-pending"); root.classList.add("intro-playing");
  ["wheel", "touchmove", "click"].forEach((ev) => window.addEventListener(ev, introSkip, { passive: true }));
  window.addEventListener("keydown", introKey);
}

/* ---------- scenes ---------- */
const scenes = {
  hero({ root: r, zone }) { zone(r, q('[data-dot-slot="hero"]', r)); },

  problem({ root: r, dir, isDesktop, on, zone }) {
    /* "One Table": three scattered workstations snap into one organised row */
    zone(r, q('[data-dot-slot="problem"]', r));
    drawLinks();
    if (!isDesktop) return;
    r.classList.add("is-pinned", "is-choreo");
    const stations = qa("[data-station]", r), links = qa("[data-link]", r), l1 = q('[data-line="1"]', r), l2 = q('[data-line="2"]', r);
    const table = q("[data-table]", r), fill = q(".gap-fill", r), head = q(".playhead", r), pulse = q(".pulse", r);
    const fx = innerWidth >= 1440 ? 1 : innerWidth >= 1100 ? 0.7 : 0.4;
    const chaos = [
      { xPercent: -38 * dir * fx, yPercent: -30, rotation: -6 * dir },
      { xPercent: 34 * dir * fx, yPercent: -18, rotation: 5 * dir },
      { xPercent: -8 * dir * fx, yPercent: 48, rotation: 3 * dir }];
    const tl = gsap.timeline({ defaults: { ease: "idone.inOut" },
      scrollTrigger: { trigger: r, pin: q("[data-pin]", r), start: "top top", end: "+=170%", scrub: 0.6, anticipatePin: 1, onRefresh: drawLinks },
      onUpdate() { drawLinks(); r.classList.toggle("is-joined", tl.progress() > 0.62); } });
    /* 1 · gather (0 → 1.2) */
    stations.forEach((s, i) => tl.from(s, { ...chaos[i], duration: 1.2 }, 0));
    /* 2 · connect (1.0 → 1.8) */
    tl.fromTo(links, { strokeDasharray: "2 8", opacity: 0.45 }, { strokeDasharray: "12 0", opacity: 1, duration: 0.8, ease: "none" }, 1.0)
      .fromTo(table, { scaleX: 0 }, { scaleX: 1, duration: 0.8 }, 1.0)
      .fromTo(head, { x: 74 }, { x: 0, duration: 0.8 }, 1.0)
      .fromTo(fill, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "none" }, 1.5)
    /* 3 · headline swap (1.4 → 2.4) */
      .to(l1, { autoAlpha: 0, y: -10, duration: 0.5 }, 1.4)
      .fromTo(l2, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.9)
    /* 4 · hold (2.4 → 3): the dot pulses once on the table line */
      .to(pulse, { keyframes: [{ autoAlpha: 0.7, scale: 1, duration: 0.02 }, { autoAlpha: 0, scale: 2.8, duration: 0.4, ease: "idone.out" }] }, 2.5)
      .to({}, { duration: 0.08 }, 2.92);
    drawLinks();
  },

  build({ root: r, dir, isDesktop, on, zone }) {
    const wrap = q(".phone-wrap", r), blocks = qa(".blk", r), box = q(".blocks", r), slot = q(".caret-slot", r), caret = q(".dot-local", slot);
    const shot = q("[data-shot]", r), cap = q(".caption-text", r), pts = qa(".list-lines li", r);
    zone(r, slot);
    let blink = null;
    const onDock = () => { if (blink) blink.kill(); blink = gsap.to(caret, { opacity: 0.25, duration: 0.5, ease: "steps(1)", yoyo: true, repeat: -1 }); };
    const onUndock = () => { if (blink) { blink.kill(); blink = null; } gsap.set(caret, { opacity: 1 }); };
    slot.addEventListener("dot:docked", onDock); slot.addEventListener("dot:undocked", onUndock);
    on(() => { slot.removeEventListener("dot:docked", onDock); slot.removeEventListener("dot:undocked", onUndock); if (blink) blink.kill(); gsap.set(caret, { clearProps: "all" }); });
    r.classList.add("is-choreo"); if (isDesktop) r.classList.add("is-pinned");
    const pos = (b) => { const o = offsetWithin(b, wrap), n = offsetWithin(slot, wrap);
      const x = dir === 1 ? o.x - 9 : o.x + b.offsetWidth + 6;
      return { x: x - n.x, y: o.y + Math.min(b.offsetHeight / 2, 13) - slot.offsetHeight / 2 - n.y }; };
    gsap.set(blocks, { opacity: 0, scale: 0.7 }); gsap.set([shot, cap], { autoAlpha: 0 });
    const tl = gsap.timeline({
      scrollTrigger: isDesktop
        ? { trigger: r, pin: q("[data-pin]", r), start: "top top", end: "+=160%", scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }
        : { trigger: wrap, start: "top 75%", once: true },
      onUpdate() { const p = tl.progress(); pts.forEach((li, i) => li.classList.toggle("is-on", p >= 0.12 + i * 0.22)); } });
    blocks.forEach((b) => {
      tl.to(caret, { x: () => pos(b).x, y: () => pos(b).y, duration: 0.45, ease: "idone.inOut" })
        .to(b, { opacity: 1, scale: 1, duration: 0.3, ease: "idone.back" }, ">-0.05");
    });
    tl.to(caret, { x: 0, y: 0, duration: 0.5, ease: "idone.inOut" }, "+=0.15")
      .to(box, { autoAlpha: 0, duration: 0.4, ease: "idone.out" }, "<")
      .to(shot, { autoAlpha: 1, duration: 0.4, ease: "idone.out" }, "<")
      .to(cap, { autoAlpha: 1, duration: 0.3, ease: "idone.out" }, ">-0.1")
      .to({}, { duration: 0.3 });
    if (!isDesktop) tl.timeScale(1.5);
  },

  video({ root: r, dir, isDesktop, on, zone }) {
    const stage = q("[data-pin]", r), track = q(".track", r), hint = q(".hint", r), slots = qa('[data-dot-slot="video"]', r);
    zone(r, () => { const vw = innerWidth;
      for (const s of slots) { const b = s.getBoundingClientRect(), cx = b.left + b.width / 2; if ((dir === 1 ? b.left >= 24 : b.right <= vw - 24) && cx > 0 && cx < vw) return s; }
      return slots[slots.length - 1]; });
    const onDock = (e) => { const reel = e.target.closest(".reel"); if (reel && reel.dataset.reel && !reel.classList.contains("is-playing")) setPlaying(reel, true, false); };
    const onUndock = (e) => { const reel = e.target.closest(".reel"); if (reel && reel.dataset.reel && !reel.dataset.user) setPlaying(reel, false, false); };
    r.addEventListener("dot:docked", onDock); r.addEventListener("dot:undocked", onUndock);
    on(() => { r.removeEventListener("dot:docked", onDock); r.removeEventListener("dot:undocked", onUndock); });
    if (!isDesktop) return;
    r.classList.add("is-pinned");
    const dist = () => Math.max(0, track.scrollWidth - track.clientWidth);
    const tl = gsap.timeline({ scrollTrigger: { trigger: stage, pin: stage, start: "top top", end: () => "+=" + Math.max(600, dist() * 1.2), scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.to(track, { x: () => -dist() * dir, ease: "none", duration: 1 }, 0)
      .to(hint, { autoAlpha: 0, ease: "none", duration: 0.25 }, 0);
  },

  automation({ root: r, dir, isDesktop, on, zone }) {
    const flow = q(".flow", r), svg = q("svg", flow), base = q(".base", svg), lit = q(".lit", svg), nodes = qa(".node", flow), slot = q(".runner-slot", flow), runner = q(".dot-local", slot);
    zone(r, slot);
    r.classList.add("is-choreo"); if (isDesktop) r.classList.add("is-pinned");
    const orig = { vb: svg.getAttribute("viewBox"), d: base.getAttribute("d") };
    const st = { p: 0 }; let L = 1, fr = [];
    const apply = () => {
      lit.style.strokeDashoffset = L * (1 - st.p);
      const pt = lit.getPointAtLength(L * st.p);
      gsap.set(runner, { x: pt.x - slot.offsetLeft, y: pt.y - slot.offsetTop });
      nodes.forEach((n, i) => n.classList.toggle("is-on", st.p >= fr[i] - 0.004));
    };
    const layout = () => {
      const W = flow.clientWidth, H = flow.clientHeight; if (!W || !H) return;
      const pts = nodes.map((n) => { const x = parseFloat(n.style.getPropertyValue("--x")) / 100 * W, y = parseFloat(n.style.getPropertyValue("--y")) / 100 * H; return [dir === 1 ? x : W - x, y]; });
      svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.classList.add("is-laid");
      const d = "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L");
      base.setAttribute("d", d); lit.setAttribute("d", d);
      L = lit.getTotalLength() || 1; let acc = 0;
      fr = pts.map((p, i) => { if (i) acc += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]); return acc / L; });
      lit.style.strokeDasharray = L; apply();
    };
    layout();
    const ro = new ResizeObserver(layout); ro.observe(flow);
    on(() => { ro.disconnect(); svg.setAttribute("viewBox", orig.vb); svg.classList.remove("is-laid"); base.setAttribute("d", orig.d); lit.setAttribute("d", orig.d);
      lit.style.strokeDasharray = ""; lit.style.strokeDashoffset = ""; gsap.set(runner, { clearProps: "all" }); });
    const tl = gsap.timeline({ scrollTrigger: isDesktop
      ? { trigger: r, pin: q("[data-pin]", r), start: "top top", end: "+=150%", scrub: 0.5, anticipatePin: 1, onRefresh: layout }
      : { trigger: flow, start: "top 75%", once: true } });
    tl.to(st, { p: 1, duration: 1, ease: "none", onUpdate: apply }).to({}, { duration: 0.3 });
    if (!isDesktop) tl.timeScale(0.45);
  },

  together({ root: r, dir, isDesktop, on, zone }) {
    const box = q(".ring-box", r), lit = q(".lit", box), tiles = qa(".tile", box), slot = q(".orbit-slot", box), local = q(".dot-local", slot), copy = qa(".tg-copy > *", r);
    zone(r, slot);
    r.classList.add("is-choreo"); if (isDesktop) r.classList.add("is-pinned");
    const st = { a: 0 };
    const off = (el) => { const v = getComputedStyle(el).translate; if (!v || v === "none") return [0, 0]; const p = v.split(" ").map(parseFloat); return [p[0] || 0, p[1] || 0]; };
    const apply = () => {
      const a = st.a * Math.PI * 2, R = box.clientWidth * 0.43;
      gsap.set(local, { x: Math.sin(a) * R * dir, y: R * (1 - Math.cos(a)) });
      lit.style.strokeDashoffset = 1 - st.a;
      tiles.forEach((tile, i) => tile.classList.toggle("is-on", st.a > 0.02 && st.a >= i / 3 - 0.001));
    };
    lit.style.strokeDasharray = 1; apply();
    on(() => { lit.style.strokeDasharray = ""; lit.style.strokeDashoffset = ""; gsap.set(local, { clearProps: "all" }); });
    const tl = gsap.timeline({ scrollTrigger: isDesktop
      ? { trigger: r, pin: q("[data-pin]", r), start: "top top", end: "+=150%", scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, onRefresh: apply }
      : { trigger: box, start: "top 70%", once: true } });
    tl.from(copy, { autoAlpha: 0, y: 20, duration: 0.35, stagger: 0.08, ease: "idone.out" }, 0)
      .from(tiles, { x: (i, el) => -off(el)[0], y: (i, el) => -off(el)[1], scale: 0.8, duration: 0.45, stagger: 0.05, ease: "idone.out" }, 0)
      .to(st, { a: 1, duration: 1.1, ease: "idone.inOut", onUpdate: apply }, 0.4)
      .to({}, { duration: 0.25 });
    if (!isDesktop) tl.timeScale(0.6);
  },

  work({ root: r, zone }) {
    const slots = qa('[data-dot-slot="work"]', r);
    zone(r, () => { let pick = slots[0]; for (const s of slots) if (s.getBoundingClientRect().top <= innerHeight * 0.6) pick = s; return pick; });
  },

  process({ root: r, isDesktop, on, zone }) {
    const list = q(".steps", r), steps = qa(".step", list), slot = q(".walker-slot", list), local = q(".dot-local", slot);
    zone(r, slot);
    r.classList.add("is-choreo");
    const m0 = () => offsetWithin(q(".marker", steps[0]), list);
    const mk = (i) => { const a = offsetWithin(q(".marker", steps[i]), list), b = m0(); return { x: a.x - b.x, y: a.y - b.y }; };
    steps[0].classList.add("is-on");
    on(() => gsap.set(local, { clearProps: "all" }));
    const tl = gsap.timeline({ scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 40%", scrub: 0.4, invalidateOnRefresh: true },
      onUpdate() { const p = tl.progress() * 3; steps.forEach((s, i) => s.classList.toggle("is-on", i === 0 || p >= i - 0.4)); } });
    for (let i = 1; i < steps.length; i++) tl.to(local, { x: () => mk(i).x, y: () => mk(i).y, duration: 1, ease: "idone.back" });
  },

  about({ root: r, zone }) { zone(r, q('[data-dot-slot="about"]', r)); },

  cta({ root: r, zone }) {
    const wait = q(".cta-wait", r), send = q(".send-slot", r), mark = q("#cta-mark", r);
    zone(r, () => { if (sent) return mark; const b = wait.getBoundingClientRect(); return b.top + b.height / 2 > HEADER_H + 8 ? wait : send; });
  }
};
const ORDER = [["scene-hero", "hero"], ["scene-problem", "problem"], ["scene-build", "build"], ["scene-video", "video"], ["scene-automation", "automation"],
  ["scene-together", "together"], ["scene-work", "work"], ["scene-process", "process"], ["scene-about", "about"], ["contact", "cta"]];

function buildScenes() {
  if (mm || !gsap || isReduced()) return;
  mm = gsap.matchMedia();
  mm.add({ desk: "(min-width:900px)", mob: "(max-width:899.98px)" }, (c) => {
    const isDesktop = !!c.conditions.desk, dir = root.dir === "rtl" ? -1 : 1, cleanups = [], zones = [];
    const dot = new DotController(q("#dot")); motion.dot = dot;
    const env = { dot, dir, isDesktop, on: (fn) => cleanups.push(fn), zone: (r, slot) => zones.push({ root: r, slot: typeof slot === "function" ? slot : () => slot }) };
    ORDER.forEach(([id, name]) => scenes[name]({ ...env, root: document.getElementById(id) }));

    /* which scene owns the dot: the last scene whose top crossed 55% of the viewport,
       but the dot stays where it is while that scene's landing spot is still off-screen */
    let live = false, dead = false, cur = null, curSlot = null, from = null;
    const inView = (slot) => { if (!slot) return false; const b = (slot.querySelector(".dot-local") || slot).getBoundingClientRect(), cy = b.top + b.height / 2, cx = b.left + b.width / 2;
      return cy > HEADER_H + 4 && cy < innerHeight - 4 && cx > 0 && cx < innerWidth; };
    const resolve = () => {
      if (!live) return;
      const line = innerHeight * 0.55; let n = zones[0];
      for (const z of zones) if (z.root.getBoundingClientRect().top <= line) n = z;
      let tgt = n;
      if (cur && n !== cur && curSlot && !inView(n.slot()) && inView(curSlot)) tgt = cur;
      const slot = tgt.slot(); cur = tgt;
      if (slot && slot !== curSlot) { curSlot = slot; dot.moveTo(slot, { from }); from = null; }
    };
    whenIntroDone(() => {
      if (dead) return; live = true;
      if (introJust) { introJust = false; const b = q("#hero-logo .lg-dot").getBoundingClientRect();
        if (b.bottom > 0 && b.top < innerHeight) from = { x: b.left + b.width / 2, y: b.top + b.height / 2, s: b.width / dot.size }; }
    });
    gsap.ticker.add(resolve);
    motion.ctaLeap = (slot, cb) => { cur = zones[zones.length - 1]; curSlot = slot; dot.leapAndVanish(slot, cb); };

    return () => {
      dead = true; gsap.ticker.remove(resolve); motion.ctaLeap = null; motion.dot = null;
      cleanups.forEach((fn) => fn()); dot.destroy();
      qa(".is-pinned,.is-choreo,.is-joined").forEach((el) => el.classList.remove("is-pinned", "is-choreo", "is-joined"));
      qa(".scene .is-on").forEach((el) => el.classList.remove("is-on"));
      qa(".is-docked").forEach((el) => el.classList.remove("is-docked"));
    };
  });
}
function killScenes() { if (mm) { mm.revert(); mm = null; } }

/* ---------- lenis (desktop only) ---------- */
const lenisRaf = (time) => { if (lenis) lenis.raf(time * 1000); };
function startLenis() {
  if (!Lenis || lenis || !mqHover.matches || isReduced()) return;
  lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(lenisRaf); gsap.ticker.lagSmoothing(0);
}
function stopLenis() { if (!lenis) return; gsap.ticker.remove(lenisRaf); lenis.destroy(); lenis = null; }

/* ---------- start / stop ---------- */
let fontsWait = null;
function startMotion(first) {
  if (!gsap || isReduced()) { root.classList.remove("intro-pending", "intro-running"); introDone = true; return null; }
  startLenis();
  if (first && willIntro) playIntro(); else { root.classList.remove("intro-pending", "intro-running"); if (!introDone) { introDone = true; introCbs.splice(0).forEach((fn) => fn()); } }
  if (!fontsWait) fontsWait = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((res) => setTimeout(res, 1500))]);
  return fontsWait.then(() => { if (isReduced()) return; buildScenes(); ScrollTrigger.refresh(); });
}
function stopMotion() {
  if (!gsap) return;
  if (introTl && introTl.progress() < 1) introTl.progress(1);
  killScenes(); stopLenis();
}

startMotion(true);
if (gsap) {
  mqHover.addEventListener("change", () => { if (mqHover.matches) startLenis(); else stopLenis(); });
  mqReduce.addEventListener("change", () => { if (motionPref) return; root.dataset.motion = isReduced() ? "reduced" : "full"; if (isReduced()) stopMotion(); else startMotion(false); syncLabels(); });
  window.addEventListener("load", () => ScrollTrigger.refresh());
}
