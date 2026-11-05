const studies = {
  title: { note: 'Solid ink remains after the photographs rearrange.', try: 'Try the replay button, hover over the title, or open a photograph.', action: 'Replay the title ↻', tradeoff: 'Trade-off: a stronger reading hierarchy, with less of the original “ghost” effect.' },
  pupils: { note: 'School-level counts sit below the model, clear of its pins.', try: 'Switch Current / Proposal, then drag the model or select the school.', action: '', tradeoff: 'Trade-off: the count is easier to read and no longer overlaps the School label; the graphic gives a little vertical space to a dedicated key.' },
  guide: { note: 'An optional field note opens within the guide’s account.', try: 'Open “What changed for her?”, then follow the family-visits phrase into the model.', action: 'Open / close her story', tradeoff: 'Trade-off: greater depth on request, with a longer guide section when expanded. The main reading path stays concise.' }
};
const params = new URLSearchParams(location.search);
let study = Object.hasOwn(studies, params.get('study')) ? params.get('study') : 'title';
let variant = params.get('variant') === 'original' ? 'original' : 'proposal';
const frame = document.querySelector('#preview');
const url = () => `study.html?study=${study}&variant=${variant}${study === 'pupils' ? '&renderer=gpu' : ''}`;
function sync(load = false) {
  const spec = studies[study];
  document.querySelectorAll('[data-study]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.study === study)));
  document.querySelectorAll('[data-variant]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.variant === variant)));
  document.querySelector('#variant-note').textContent = `${variant === 'original' ? 'Current' : 'Proposal'} · ${variant === 'original' ? 'The design on the live draft.' : spec.note}`;
  document.querySelector('#try-it').textContent = spec.try;
  const action = document.querySelector('#try-action');
  action.textContent = spec.action; action.hidden = !spec.action || (study === 'guide' && variant === 'original');
  document.querySelector('.open-study').href = url();
  document.querySelector('.gpu-note').hidden = study !== 'pupils';
  document.querySelector('#tradeoff').textContent = spec.tradeoff;
  document.querySelector('#phone-capture').href = `captures/${study}-phone.jpg`;
  const interaction = document.querySelector('#interaction-capture');
  interaction.hidden = study === 'pupils';
  interaction.href = study === 'guide' ? 'captures/guide-interaction.jpg' : 'captures/title-in-motion.jpg';
  for (const kind of ['current', 'proposal']) {
    const src = `captures/${study}-${kind}.jpg`;
    document.querySelector(`#${kind}-capture`).src = src;
    document.querySelector(`#${kind}-capture`).alt = `${kind === 'current' ? 'Current' : 'Proposed'} treatment: ${spec.note}`;
    document.querySelector(`#${kind}-link`).href = src;
  }
  history.replaceState(null, '', `?study=${study}&variant=${variant}`);
  if (load) frame.src = url();
  else frame.contentWindow?.postMessage({ type: 'crossing-study', study, variant }, location.origin);
}
document.querySelectorAll('[data-study]').forEach(b => b.addEventListener('click', () => { study = b.dataset.study; sync(true); }));
document.querySelectorAll('[data-variant]').forEach(b => b.addEventListener('click', () => { variant = b.dataset.variant; sync(); }));
document.querySelector('.device').addEventListener('click', event => {
  const on = event.currentTarget.getAttribute('aria-pressed') !== 'true';
  event.currentTarget.setAttribute('aria-pressed', String(on));
  document.querySelector('.preview-wrap').classList.toggle('is-phone', on);
});
document.querySelector('#try-action').addEventListener('click', () => frame.contentWindow?.postMessage({ type: 'crossing-study', study, variant, action: study === 'title' ? 'replay' : 'expand' }, location.origin));
addEventListener('message', event => { if (event.origin === location.origin && event.source === frame.contentWindow && event.data?.type === 'crossing-study-ready') sync(); });
addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'crossing-study-renderer') return;
  document.querySelector('.gpu-note').textContent = event.data.renderer === 'webgpu'
    ? 'WebGPU is running in this comparison. Each point is one pupil; switch Current / Proposal to compare the count labels.'
    : 'This browser is using the SVG fallback. If WebGPU does not start, use the native-WebGPU screenshots below to compare the count strip. The live study needs a WebGPU-capable browser.';
});
sync(true);
