/* Crossing Lives — page controller for the 5 November 2026 edition.
   Native scrolling and buttons stay in charge; components enhance static
   markup that remains readable without JavaScript. */
import { hydrateGlyphs, motionAllowed } from './grammar.js';
import { tour } from './cast.js';

const html = document.documentElement;
const V = '20261105-edition';

/* Motion: one control for the page; reduced-motion preference wins. */
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let paused = motionQuery.matches;
const motionButton = document.querySelector('#motion-control');
function motionUI() {
  html.dataset.motion = paused ? 'off' : 'on';
  if (motionButton) {
    motionButton.querySelector('span').textContent = paused ? 'Resume motion' : 'Pause motion';
    motionButton.setAttribute('aria-label', paused ? 'Resume motion' : 'Pause motion');
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.querySelector('svg').innerHTML = paused ? '<path d="M6 3 16 10 6 17Z"/>' : '<path d="M7 4v12M13 4v12"/>';
  }
  document.dispatchEvent(new CustomEvent('crossing:motion', { detail: { paused } }));
}
motionUI();
motionButton?.addEventListener('click', () => { paused = !paused; motionUI(); });
motionQuery.addEventListener('change', event => { paused = event.matches; motionUI(); });

hydrateGlyphs();

function fail(element, retry) {
  element.replaceChildren();
  const p = document.createElement('p');
  p.className = 'component-error';
  p.textContent = 'This interactive section could not load. The story remains available. ';
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = 'Try again'; b.addEventListener('click', retry);
  p.append(b);
  element.append(p);
}
const mounts = [];
function mount(selector, loader) { const pending = mountNow(selector, loader); mounts.push(pending); return pending; }
async function mountNow(selector, loader) {
  const host = document.querySelector(selector);
  if (!host) return null;
  try { return await loader(host); }
  catch (error) { console.error('Component failed:', selector, error); fail(host, () => mountNow(selector, loader)); return null; }
}

/* ---- Opening: the miniature and its account tour ---- */
const scrolly = document.querySelector('.scrolly');
const steps = [...document.querySelectorAll('.step[data-scene]')];
const switcher = document.querySelector('.tour-switch');
let mini = null;

mount('#miniature', async host => {
  const { initMiniature } = await import(`./miniature.js?v=${V}`);
  mini = initMiniature(host);
  scrolly?.classList.add('is-enhanced');
  syncStep(true);
  return mini;
});

let currentStep = null, stepFrame = 0;
function activeStep() {
  const narrow = innerWidth < 1100;
  const line = narrow ? innerHeight * .8 : innerHeight * .56;
  let pick = steps[0];
  for (const step of steps) if (step.getBoundingClientRect().top <= line) pick = step;
  return pick;
}
function syncStep(force = false) {
  stepFrame = 0;
  const step = activeStep();
  if (!step || (step === currentStep && !force)) return;
  currentStep = step;
  steps.forEach(s => s.classList.toggle('is-active', s === step));
  const scene = step.dataset.scene;
  mini?.setScene(scene, { animate: !force });
  switcher?.querySelectorAll('[data-go]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.go === scene)));
  const counter = document.querySelector('.tour-count');
  if (counter) { const i = tour.indexOf(scene); counter.textContent = i >= 0 ? `${i + 1} / ${tour.length}` : scene === 'together' ? 'All five' : ''; }
}
addEventListener('scroll', () => { if (!stepFrame) stepFrame = requestAnimationFrame(() => syncStep()); }, { passive: true });
addEventListener('resize', () => syncStep(true));

function goToStep(scene) {
  const step = steps.find(s => s.dataset.scene === scene);
  if (!step) return;
  const rect = step.getBoundingClientRect();
  const narrow = innerWidth < 1100;
  const offset = narrow ? innerHeight * .8 - 40 : innerHeight * .56 - Math.min(rect.height / 2, innerHeight * .3);
  scrollTo({ top: scrollY + rect.top - offset + 2, behavior: motionAllowed() ? 'smooth' : 'instant' });
}
switcher?.addEventListener('click', event => { const b = event.target.closest('[data-go]'); if (b) goToStep(b.dataset.go); });
document.addEventListener('mini:request-scene', event => goToStep(event.detail.id));

/* ---- Story components ---- */
mount('#life-ledger', async host => (await import(`./ledger.js?v=${V}`)).initLedger(host));
mount('#reasons', async host => (await import(`./lens-choices.js?v=${V}`)).initReasons(host));
mount('#basket', async host => (await import(`./lens-choices.js?v=${V}`)).initBasket(host));
mount('#service-trail', async host => (await import(`./lens-services.js?v=${V}`)).initServiceTrail(host));
mount('#care-loop', async host => (await import(`./lens-services.js?v=${V}`)).initCareLoop(host));
mount('#ties-panel', async host => (await import(`./lens-ties.js?v=${V}`)).initTies(host));
mount('#echo', async host => (await import(`./echo.js?v=${V}`)).initEcho(host));

/* ---- Research desk: modules load the first time their shelf opens ---- */
const dataCache = new Map();
function getData(path) {
  if (!dataCache.has(path)) {
    const request = fetch(new URL(path, import.meta.url)).then(r => { if (!r.ok) throw new Error(`Data request failed (${r.status})`); return r.json(); }).catch(error => { dataCache.delete(path); throw error; });
    dataCache.set(path, request);
  }
  return dataCache.get(path);
}
const loaders = {
  '#policy-map': async host => (await import('./policy-map.js?v=20261031-v3')).mountPolicyMap(host),
  '#research-overview': async host => (await import('./research-overview.js?v=20261101-script')).mountResearchOverview(host),
  '#field-gallery': async host => (await import('./field-gallery.js?v=20261031-v3')).initFieldGallery(host),
  '#opening-game': async host => (await import('./game.js?v=20261031-v3')).initGame(host),
  '[data-evidence]': async host => (await import('./evidence.js?v=20261031-v3')).initEvidence(host, await getData('../research-data.json')),
  '[data-everyday-view]': async host => (await import('./everyday.js?v=20261031-v3')).initEveryday(host, await getData('./everyday-data.json')),
  '[data-library]': async host => {
    const [{ initLibrary }, cases, measurement, research] = await Promise.all([import('./library.js?v=20261101-script'), getData('../data/response-cases.json'), getData('./measurement-menu.json?v=20261101-script'), getData('../research-data.json')]);
    return initLibrary(host, cases, measurement, research.future);
  }
};
const loaded = new WeakSet();
async function loadShelf(details) {
  const pending = [];
  for (const [selector, loader] of Object.entries(loaders)) {
    details.querySelectorAll(selector).forEach(host => {
      if (loaded.has(host)) return;
      loaded.add(host);
      const run = async () => { try { await loader(host); } catch (error) { console.error('Research shelf failed:', selector, error); loaded.delete(host); fail(host, () => { loaded.add(host); run(); }); } };
      pending.push(run());
    });
  }
  await Promise.all(pending);
}
document.querySelectorAll('details.shelf').forEach(details => details.addEventListener('toggle', () => { if (details.open) loadShelf(details).then(progress); }));

/* ---- Deep links: legacy anchors map onto the new edition ---- */
const ALIASES = { arrangements: 'accounts', story: 'ledger', selective: 'choices', access: 'services', 'two-way': 'johor', 'regional-context': 'about-inquiry' };
function revealTarget(hash, focus = false) {
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return null; }
  if (!id) return null;
  const target = document.getElementById(ALIASES[id] || id) || document.getElementById(id);
  if (!target) return null;
  for (let node = target; node; node = node.parentElement) if (node.tagName === 'DETAILS' && !node.open) node.open = true;
  if (focus) {
    target.setAttribute('tabindex', '-1');
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    requestAnimationFrame(() => target.focus({ preventScroll: true }));
  }
  return target;
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = revealTarget(link.hash, true);
  if (target && ALIASES[link.hash.slice(1)]) { event.preventDefault(); target.scrollIntoView({ behavior: motionAllowed() ? 'smooth' : 'instant', block: 'start' }); history.replaceState(null, '', `#${target.id}`); }
  if (link.closest('.contents-panel')) document.querySelector('#contents-menu').open = false;
});
addEventListener('hashchange', () => revealTarget(location.hash));
const initialTarget = revealTarget(location.hash);
if (initialTarget) {
  const details = initialTarget.closest('details.shelf');
  // Wait until components above the target have replaced their fallbacks.
  Promise.allSettled([...mounts, details ? loadShelf(details) : null, document.fonts?.ready]).then(() => requestAnimationFrame(() => initialTarget.scrollIntoView({ behavior: 'instant', block: 'start' })));
}

/* ---- Reading progress and current chapter ---- */
let progressFrame = 0;
function progress() {
  progressFrame = 0;
  const end = document.querySelector('#conclusion');
  const distance = end ? end.offsetTop + end.offsetHeight - innerHeight : html.scrollHeight - innerHeight;
  html.style.setProperty('--read-progress', `${distance > 0 ? Math.max(0, Math.min(100, scrollY / distance * 100)) : 0}%`);
  const header = document.querySelector('.masthead').getBoundingClientRect().height + innerHeight * .2;
  let current = null;
  for (const section of document.querySelectorAll('[data-chapter-id]')) if (section.getBoundingClientRect().top <= header) current = section;
  const id = current?.dataset.chapterId || 'accounts';
  document.querySelectorAll('[data-chapter]').forEach(link => { if (link.dataset.chapter === id) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  const label = document.querySelector('.current-chapter');
  if (label && current) label.textContent = current.dataset.chapterTitle;
}
addEventListener('scroll', () => { if (!progressFrame) progressFrame = requestAnimationFrame(progress); }, { passive: true });
addEventListener('resize', progress);
document.querySelectorAll('details').forEach(d => d.addEventListener('toggle', progress));
progress();

/* ---- Contents menu ---- */
const contents = document.querySelector('#contents-menu');
if (contents) {
  const summary = contents.querySelector('summary');
  contents.addEventListener('keydown', event => { if (event.key === 'Escape' && contents.open) { contents.open = false; summary.focus(); } });
  document.addEventListener('pointerdown', event => { if (contents.open && !contents.contains(event.target)) contents.open = false; });
}
html.dataset.ready = 'true';

/* ---- Work-in-progress notice: acknowledged once per tab session; the static
   header label and in-page notice remain when storage or JS is unavailable. ---- */
const statusPopup = document.querySelector('#status-popup');
const statusStorageKey = 'crossing-lives:website-wip-acknowledged';
let statusAcknowledged = false;
try { statusAcknowledged = sessionStorage.getItem(statusStorageKey) === 'yes'; } catch {}
if (statusPopup && typeof statusPopup.showModal === 'function' && !statusAcknowledged) {
  const previousFocus = document.activeElement;
  statusPopup.addEventListener('close', () => {
    html.classList.remove('status-popup-open');
    try { sessionStorage.setItem(statusStorageKey, 'yes'); } catch {}
    const returnFocus = previousFocus && previousFocus !== document.body && previousFocus.isConnected ? previousFocus : document.querySelector('.masthead .wordmark');
    returnFocus?.focus({ preventScroll: true });
  }, { once: true });
  statusPopup.showModal();
  html.classList.add('status-popup-open');
}
