'use strict';

(() => {
  const byId = (id) => document.getElementById(id);
  const stage = byId('stage');
  const viewer = byId('viewer');
  const dialog = byId('sources-dialog');
  const sceneDialog = byId('scenes-dialog');
  const studyMode = false;
  const sceneName = studyMode ? 'study' : 'slide';
  const dataFile = studyMode ? 'review-data.json' : 'presentation-data.json';
  const framePattern = studyMode ? /^frames\/[a-zA-Z0-9][a-zA-Z0-9_.-]*\.svg$/ : /^presentation-frames\/[a-zA-Z0-9][a-zA-Z0-9_.-]*\.svg$/;
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const frames = new Map();
  let scenes = [];
  let sceneIndex = 0;
  let steps = [];
  let revealed = 0;
  let reduceMotion = motionPreference.matches;
  let motionWasChosen = false;
  let loading = true;
  let loadSequence = 0;

  const text = (value) => typeof value === 'string' ? value : '';
  const announce = (message) => { byId('status').textContent = message; };
  const countLabel = () => scenes.length ? `${String(sceneIndex + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}` : '— / —';
  const nativeKeyTargets = [
    'input', 'select', 'textarea', 'summary', '[contenteditable]', '[data-native-keys]',
    ...['button', 'checkbox', 'radio', 'switch', 'slider', 'spinbutton', 'combobox',
      'listbox', 'option', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
      'menuitemradio', 'radiogroup', 'tablist', 'tab', 'tree', 'treeitem',
      'treegrid', 'grid', 'textbox', 'searchbox', 'dialog'].map((role) => `[role="${role}"]`),
  ].join(', ');

  function hashSceneIndex() {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return -1; }
    return id ? scenes.findIndex((scene) => scene.id === id) : -1;
  }

  function pushSceneHash(scene) {
    if (!scene.id || hashSceneIndex() === sceneIndex) return;
    const url = new URL(window.location.href);
    url.hash = encodeURIComponent(scene.id);
    // pushState leaves hashchange to browser back/forward or explicit hash navigation.
    window.history.pushState(null, '', url);
  }

  function refreshControls() {
    const atStart = loading || (sceneIndex === 0 && (revealed === 0 || reduceMotion));
    const atEnd = loading || (sceneIndex === scenes.length - 1 && revealed === steps.length);
    ['previous', 'fullscreen-prev'].forEach((id) => { byId(id).disabled = atStart; });
    ['next', 'fullscreen-next'].forEach((id) => { byId(id).disabled = atEnd; });
    byId('sources').disabled = loading || !scenes.length;
    ['scenes-trigger', 'fullscreen-scenes'].forEach((id) => {
      byId(id).disabled = loading || !scenes.length;
      byId(id).setAttribute('aria-label', scenes.length ? `Choose a ${sceneName}, current ${sceneName} ${sceneIndex + 1} of ${scenes.length}` : `Choose a ${sceneName}`);
    });
    byId('scene-count').textContent = countLabel();
    byId('fullscreen-count').textContent = countLabel();
    byId('scene-list').querySelectorAll('[data-scene-index]').forEach((button) => {
      if (Number(button.dataset.sceneIndex) === sceneIndex) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    byId('reveal-count').textContent = steps.length ? (revealed === steps.length ? 'All evidence visible' : `Reveal ${revealed} of ${steps.length}`) : '';
    byId('motion').textContent = reduceMotion ? 'Motion off' : 'Motion on';
    byId('motion').setAttribute('aria-pressed', String(!reduceMotion));
    byId('motion').title = reduceMotion ? 'Turn motion on for manual reveals' : 'Turn motion off and show all evidence';
    document.body.classList.toggle('motion-off', reduceMotion);
  }

  function applyReveal(shouldAnnounce = true) {
    stage.querySelectorAll('[data-reveal]').forEach((group) => {
      const step = Number(group.dataset.reveal);
      const concealed = steps.includes(step) && steps.indexOf(step) >= revealed;
      group.classList.toggle('is-concealed', concealed);
      if (concealed) group.setAttribute('aria-hidden', 'true');
      else group.removeAttribute('aria-hidden');
    });
    refreshControls();
    if (shouldAnnounce) {
      const detail = steps.length ? (revealed === steps.length ? 'All evidence visible.' : `Reveal ${revealed} of ${steps.length}.`) : '';
      announce(`${studyMode ? 'Study' : 'Slide'} ${sceneIndex + 1} of ${scenes.length}: ${scenes[sceneIndex].title}. ${detail}`);
    }
  }

  async function fetchFrame(path) {
    // Frames are authored in this repository. Data may select only a local SVG filename.
    if (!framePattern.test(path)) throw new Error('Invalid local frame path.');
    if (!frames.has(path)) {
      frames.set(path, (async () => {
        const response = await fetch(new URL(path, document.baseURI));
        if (!response.ok) throw new Error(`Frame unavailable (${response.status}).`);
        const parsed = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
        const svg = parsed.documentElement;
        if (svg.localName !== 'svg' || svg.namespaceURI !== 'http://www.w3.org/2000/svg' || parsed.querySelector('parsererror')) throw new Error('Invalid SVG frame.');
        // The shell never imports executable content from a study.
        svg.querySelectorAll('script, foreignObject, iframe, object, embed').forEach((node) => node.remove());
        [svg, ...svg.querySelectorAll('*')].forEach((node) => {
          [...node.attributes].forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const isEmbeddedRaster = node.localName === 'image' && /^(?:data:image\/(?:jpeg|png);base64,)[A-Za-z0-9+/]+={0,2}$/.test(attribute.value);
            if (name.startsWith('on') || ((name === 'href' || name === 'xlink:href') && !attribute.value.startsWith('#') && !isEmbeddedRaster)) node.removeAttribute(attribute.name);
          });
        });
        return document.importNode(svg, true);
      })());
    }
    return (await frames.get(path)).cloneNode(true);
  }

  async function showScene(index, position = 'start', updateHash = true) {
    if (!scenes[index]) return;
    const sequence = ++loadSequence;
    loading = true;
    stage.setAttribute('aria-busy', 'true');
    refreshControls();
    try {
      const scene = scenes[index];
      const svg = await fetchFrame(scene.svg);
      if (sequence !== loadSequence) return;
      const sceneChanged = sceneIndex !== index;
      sceneIndex = index;
      steps = [...new Set([...svg.querySelectorAll('[data-reveal]')].map((group) => Number(group.dataset.reveal)).filter((step) => Number.isFinite(step) && step > 0))].sort((a, b) => a - b);
      revealed = reduceMotion || position === 'end' ? steps.length : 0;
      if (!svg.hasAttribute('role')) svg.setAttribute('role', 'img');
      if (!svg.hasAttribute('aria-label') && !svg.hasAttribute('aria-labelledby')) svg.setAttribute('aria-label', scene.title);
      stage.replaceChildren(svg);
      stage.parentElement.scrollLeft = 0;
      byId('scene-title').textContent = scene.title;
      byId('scene-subtitle').textContent = scene.subtitle;
      loading = false;
      stage.setAttribute('aria-busy', 'false');
      applyReveal();
      if (sceneChanged && updateHash) pushSceneHash(scene);
    } catch (error) {
      if (sequence !== loadSequence) return;
      loading = false;
      stage.setAttribute('aria-busy', 'false');
      const message = document.createElement('p');
      message.className = 'stage-message';
      message.textContent = `This ${sceneName} could not be loaded. Check that its SVG is in the local frames folder, then refresh.`;
      stage.replaceChildren(message);
      refreshControls();
      announce(message.textContent);
      console.error(error);
    }
  }

  function next() {
    if (loading) return;
    if (revealed < steps.length) { revealed += 1; applyReveal(); }
    else if (sceneIndex < scenes.length - 1) void showScene(sceneIndex + 1);
  }

  function previous() {
    if (loading) return;
    if (!reduceMotion && revealed > 0) { revealed -= 1; applyReveal(); }
    else if (sceneIndex > 0) void showScene(sceneIndex - 1, 'end');
  }

  function buildScenePicker() {
    const list = byId('scene-list');
    list.replaceChildren();
    scenes.forEach((scene, index) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'scene-choice';
      button.dataset.sceneIndex = String(index);
      const number = document.createElement('span');
      number.className = 'scene-choice-number';
      number.textContent = String(index + 1).padStart(2, '0');
      const title = document.createElement('span');
      title.className = 'scene-choice-title';
      title.textContent = scene.title;
      button.append(number, title);
      item.append(button);
      list.append(item);
    });
  }

  function openScenePicker() {
    if (loading || !scenes.length) return;
    sceneDialog.showModal();
    const selected = byId('scene-list').querySelector('[aria-current="step"]');
    if (selected) {
      selected.focus({ preventScroll: true });
      selected.scrollIntoView({ block: 'nearest' });
    }
  }

  function openSources() {
    const scene = scenes[sceneIndex];
    if (!scene || loading) return;
    byId('sources-title').textContent = scene.title;
    byId('source-note').textContent = scene.sourceNote || `Source notes are pending for this ${sceneName}.`;
    const links = byId('source-links');
    links.replaceChildren();
    scene.sourceLinks.forEach((source) => {
      let url;
      try { url = new URL(source.url); } catch { return; }
      if (!['https:', 'http:'].includes(url.protocol)) return;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = url.href;
      link.textContent = text(source.label) || url.hostname;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      item.append(link);
      links.append(item);
    });
    links.hidden = !links.childElementCount;
    byId('review-question-section').hidden = !scene.reviewQuestion;
    byId('review-question').textContent = scene.reviewQuestion;
    dialog.showModal();
  }

  function setMotionPreference(reduced) {
    reduceMotion = reduced;
    if (reduceMotion) revealed = steps.length;
    applyReveal(false);
    announce(reduceMotion ? 'Motion off. All evidence is visible.' : 'Motion on. New scenes use manual reveals.');
  }

  byId('next').addEventListener('click', next);
  byId('fullscreen-next').addEventListener('click', next);
  byId('previous').addEventListener('click', previous);
  byId('fullscreen-prev').addEventListener('click', previous);
  byId('sources').addEventListener('click', openSources);
  byId('close-sources').addEventListener('click', () => dialog.close());
  byId('scenes-trigger').addEventListener('click', openScenePicker);
  byId('fullscreen-scenes').addEventListener('click', openScenePicker);
  byId('close-scenes').addEventListener('click', () => sceneDialog.close());
  byId('scene-list').addEventListener('click', async (event) => {
    const button = event.target instanceof Element ? event.target.closest('[data-scene-index]') : null;
    if (!button) return;
    const index = Number(button.dataset.sceneIndex);
    const returnTarget = byId(document.fullscreenElement ? 'fullscreen-scenes' : 'scenes-trigger');
    sceneDialog.close();
    await showScene(index);
    if (sceneIndex === index && !loading && !dialog.open && !sceneDialog.open) returnTarget.focus({ preventScroll: true });
  });
  byId('scene-list').addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const buttons = [...byId('scene-list').querySelectorAll('button')];
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1)));
    buttons[target].focus();
  });
  byId('motion').addEventListener('click', () => { motionWasChosen = true; setMotionPreference(!reduceMotion); });
  motionPreference.addEventListener('change', (event) => { if (!motionWasChosen) setMotionPreference(event.matches); });

  byId('fullscreen').addEventListener('click', async () => {
    if (!viewer.requestFullscreen) { announce('Fullscreen is unavailable in this browser.'); return; }
    try { await viewer.requestFullscreen(); viewer.focus(); }
    catch { announce('Fullscreen could not be opened in this browser.'); }
  });
  byId('exit-fullscreen').addEventListener('click', () => { if (document.fullscreenElement) void document.exitFullscreen(); });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) byId('fullscreen').focus();
  });

  document.addEventListener('keydown', (event) => {
    if (loading || dialog.open || sceneDialog.open || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target instanceof Element && event.target.closest(nativeKeyTargets)) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key)) { event.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) { event.preventDefault(); previous(); }
    else if (event.key === 'Home') { event.preventDefault(); void showScene(0); }
    else if (event.key === 'End') { event.preventDefault(); void showScene(scenes.length - 1, 'end'); }
  });

  window.addEventListener('hashchange', () => {
    if (!scenes.length) return;
    const index = Math.max(0, hashSceneIndex());
    if (index === sceneIndex && !loading) return;
    if (dialog.open) dialog.close();
    if (sceneDialog.open) sceneDialog.close();
    void showScene(index, 'start', false);
  });

  function configureMode() {
    document.body.classList.toggle('study-mode', studyMode);
    byId('collection-title').textContent = studyMode ? 'Visual studies' : 'Crossing lives';
    byId('wordmark').href = studyMode ? '?studies=1' : './';
    byId('wordmark').setAttribute('aria-label', studyMode ? 'Jamie, visual studies' : 'Jamie, crossing lives');
    byId('scene-title').textContent = studyMode ? 'Visual studies' : 'Crossing lives';
    byId('companion-links').hidden = studyMode;
    byId('working-badge').hidden = studyMode;
    byId('picker-label').textContent = studyMode ? 'All studies' : 'All slides';
    byId('scenes-title').textContent = studyMode ? 'Visual studies' : 'Presentation';
    byId('scene-list').setAttribute('aria-label', studyMode ? 'Visual studies' : 'Presentation scenes');
    viewer.setAttribute('aria-label', studyMode ? 'Visual study viewer' : 'Presentation viewer');
    stage.parentElement.setAttribute('aria-label', studyMode ? 'Visual study' : 'Presentation slide');
    byId('scroll-hint').textContent = `Swipe horizontally to explore the full ${sceneName}.`;
    ['previous', 'fullscreen-prev'].forEach((id) => byId(id).setAttribute('aria-label', `Previous reveal or ${sceneName}`));
    ['next', 'fullscreen-next'].forEach((id) => byId(id).setAttribute('aria-label', `Next reveal or ${sceneName}`));
    byId('previous').title = `Previous reveal or ${sceneName} (←)`;
    byId('next').title = `Next reveal or ${sceneName} (→)`;
    byId('draft-label').textContent = studyMode ? 'Visual studies · draft for discussion' : 'Presentation draft';
    byId('keyboard-hint').textContent = `Use ← → to move through ${studyMode ? 'each study' : 'the presentation'}. Home / End jump to the beginning / end.`;
    byId('dialog-caveat').textContent = `${studyMode ? 'Provisional visual study' : 'Working presentation draft'} for private review. Source scope and caveats remain part of the claim.`;
    const loadingMessage = stage.querySelector('.stage-message');
    if (loadingMessage) loadingMessage.textContent = studyMode ? 'Loading the studies…' : 'Loading the presentation…';
  }

  async function revealAvailablePdf() {
    if (studyMode) return;
    try {
      const response = await fetch(new URL('presentation.pdf', document.baseURI), { method: 'HEAD' });
      byId('pdf-link').hidden = !response.ok;
    } catch { /* Keep the link hidden until the local PDF is available. */ }
  }

  async function start() {
    configureMode();
    refreshControls();
    void revealAvailablePdf();
    try {
      const response = await fetch(new URL(dataFile, document.baseURI));
      if (!response.ok) throw new Error(`Presentation data unavailable (${response.status}).`);
      const data = await response.json();
      if (!Array.isArray(data.scenes) || !data.scenes.length) throw new Error('No scenes are available.');
      scenes = data.scenes.map((scene) => ({
        id: text(scene.id), title: text(scene.title), subtitle: text(scene.subtitle), svg: text(scene.svg),
        sourceNote: text(scene.sourceNote), reviewQuestion: text(scene.reviewQuestion),
        sourceLinks: Array.isArray(scene.sourceLinks) ? scene.sourceLinks.filter((link) => link && typeof link === 'object') : [],
      }));
      buildScenePicker();
      if (text(data.title)) document.title = data.title;
      byId('draft-label').textContent = studyMode ? `${scenes.length} studies · draft for discussion` : 'Presentation draft';
      // An absent or unknown hash opens the first scene without rewriting the URL.
      await showScene(Math.max(0, hashSceneIndex()), 'start', false);
    } catch (error) {
      loading = true;
      stage.setAttribute('aria-busy', 'false');
      const message = document.createElement('p');
      message.className = 'stage-message';
      message.textContent = `The ${studyMode ? 'studies' : 'presentation'} could not be loaded. Open this folder through a local web server, then refresh.`;
      stage.replaceChildren(message);
      refreshControls();
      announce(message.textContent);
      console.error(error);
    }
  }

  void start();
})();
