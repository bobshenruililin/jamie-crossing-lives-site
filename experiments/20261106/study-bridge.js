/* A small, same-origin comparison bridge. No settings leak into the main site. */
(() => {
  const params = new URLSearchParams(location.search);
  const allowedStudies = ['title', 'pupils', 'guide'];
  let study = allowedStudies.includes(params.get('study')) ? params.get('study') : 'title';
  let variant = params.get('variant') === 'original' ? 'original' : 'proposal';
  const set = (nextStudy = study, nextVariant = variant) => {
    study = allowedStudies.includes(nextStudy) ? nextStudy : study;
    variant = nextVariant === 'original' ? 'original' : 'proposal';
    document.documentElement.dataset.labStudy = study;
    document.documentElement.dataset.labVariant = variant;
    document.dispatchEvent(new CustomEvent('crossing:study', { detail: { study, variant } }));
  };
  set();
  addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent || event.data?.type !== 'crossing-study') return;
    set(event.data.study, event.data.variant);
    if (event.data.action === 'replay') document.querySelector('.rearrange-replay')?.click();
    if (event.data.action === 'expand') {
      const detail = document.querySelector('#guide-story');
      if (detail) detail.open = !detail.open;
    }
  });
  const ready = setInterval(() => {
    if (!document.querySelector('.mini-mark') || !document.querySelector('#hero-type.is-ready')) return;
    clearInterval(ready);
    // Keep the actual WIP popup in standalone previews. A same-origin embedded
    // comparison has its own explicit review banner and closes only this dialog.
    if (parent !== window) document.querySelector('#status-popup[open]')?.close();
    if (study === 'title') scrollTo({ top: 0, behavior: 'instant' });
    else document.dispatchEvent(new CustomEvent('mini:request-scene', { detail: { id: study } }));
    const tellRenderer = () => parent.postMessage({ type: 'crossing-study-renderer', renderer: document.querySelector('#miniature').dataset.renderer }, location.origin);
    new MutationObserver(tellRenderer).observe(document.querySelector('#miniature'), { attributes: true, attributeFilter: ['data-renderer'] });
    tellRenderer();
    parent.postMessage({ type: 'crossing-study-ready', study }, location.origin);
  }, 100);
  setTimeout(() => clearInterval(ready), 15000);
  window.crossingStudy = { set, getState: () => ({ study, variant }) };
})();
