/* Short, reversible account tour. Native scrolling and buttons remain in charge. */
export function initAccountTour(host, world) {
  if (!host || !world?.selectCase) return { destroy() {} };
  const stage = host.querySelector('.model-stage');
  const steps = [...host.querySelectorAll('[data-profile]')];
  const wide = matchMedia('(min-width: 1100px) and (min-height: 700px)');
  let current = null, frame = 0, active = false, stopped = false;
  host.classList.add('is-enhanced');
  function select(step) {
    if (!step || step === current) return;
    current = step;
    steps.forEach(node => node.classList.toggle('is-current', node === step));
    world.selectCase(step.dataset.profile, { announce: false, motion: false });
  }
  function update() {
    frame = 0;
    if (!active || stopped) return;
    const threshold = innerHeight * .54;
    let selected = steps[0];
    for (const step of steps) {
      if (step.getBoundingClientRect().top <= threshold) selected = step;
    }
    const rect = host.getBoundingClientRect();
    if (rect.top < innerHeight && rect.bottom > 0) select(selected);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function fit() {
    if (stopped) return;
    host.classList.remove('is-scrolly');
    host.classList.toggle('is-candidate', wide.matches);
    const header = document.querySelector('.masthead')?.getBoundingClientRect().height || 72;
    active = wide.matches && stage.getBoundingClientRect().height <= innerHeight - header - 25;
    host.classList.toggle('is-scrolly', active);
    host.classList.remove('is-candidate');
    schedule();
  }
  function manual(event) {
    // Mark the current reading step as handled. A manual choice stays selected
    // until the reader enters another step; it never scrolls or moves focus.
    if (!active) return;
    const threshold = innerHeight * .54;
    current = steps.filter(step => step.getBoundingClientRect().top <= threshold).at(-1) || steps[0];
    steps.forEach(step => step.classList.toggle('is-current', step.dataset.profile === event.detail?.id));
  }
  function disclosure(event) {
    if (event.target.tagName === 'DETAILS') host.classList.toggle('model-expanded', event.target.open);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', fit);
  wide.addEventListener('change', fit);
  host.addEventListener('crossing:case', manual);
  host.addEventListener('toggle', disclosure, true);
  document.fonts?.ready.then(fit);
  requestAnimationFrame(fit);
  return { destroy() { stopped = true; cancelAnimationFrame(frame); removeEventListener('scroll', schedule); removeEventListener('resize', fit); wide.removeEventListener('change', fit); host.removeEventListener('crossing:case', manual); host.removeEventListener('toggle', disclosure, true); host.classList.remove('is-enhanced', 'is-scrolly', 'is-candidate'); } };
}
