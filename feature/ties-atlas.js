let tiesInstance = 0;

// Original still-life symbols. These depict categories of ties, not possessions,
// photographed places, people, routes, or the quantity/strength of a relationship.
const objects = {
  rental: `<path class="ta-object-soft" d="M27 26 80 17 91 25 91 105 27 105Z"/><path class="ta-object-paper" d="M27 26 80 17 80 105 27 105Z"/><path class="ta-object-line" d="M39 40 68 35 68 105M39 40V105M60 70h4"/><path class="ta-object-accent" d="M81 69h18v17H81Z"/><path class="ta-object-line" d="M86 74h8v7h-8ZM91 86v17h8v-6h-8"/>`,
  university: `<path class="ta-object-ink" d="M19 91h81v7H19Z"/><path class="ta-object-line" d="M27 98v9M92 98v9"/><path class="ta-object-paper" d="M30 79h64v12H30Z"/><path class="ta-object-soft" d="M24 65h62v14H24Z"/><path class="ta-object-line" d="M32 70h44M37 84h46"/><path class="ta-object-accent" d="M45 29h43v36H45Z"/><path class="ta-object-paper" d="M49 33h35v27H49Z"/><path class="ta-object-line" d="M55 41h22M55 47h22M55 53h13M58 60v5"/>`,
  property: `<path class="ta-object-soft" d="m29 84 49-14 20 15-48 17Z"/><path class="ta-object-accent" d="M34 25h32v32H34Z"/><path class="ta-object-paper" d="M43 34h14v14H43Z"/><path class="ta-object-ink" d="M47 57h9v35h18v-9H56V73h10v-8H56Z"/><path class="ta-object-line" d="m66 41 20 8v23l-12 7-10-8V48"/>`,
  family: `<path class="ta-object-soft" d="m20 98 62-6 21 13-64 3Z"/><path class="ta-object-ink" d="M25 32h63v67H25Z"/><path class="ta-object-paper" d="M31 38h51v54H31Z"/><path class="ta-object-soft" d="M39 48h35v28H39Z"/><path class="ta-object-line" d="m39 48 18 14 17-14M39 76l12-10m23 10L62 66M39 84h20"/><path class="ta-object-accent" d="m75 79 21-5 6 24-22 5Z"/>`,
  friends: `<path class="ta-object-soft" d="m18 99 70-6 20 13H35Z"/><path class="ta-object-line" d="M75 54h20v24H84M38 65H22v24h18"/><path class="ta-object-paper" d="M57 44h27v49H57Z"/><path class="ta-object-accent" d="M35 56h30v44H35Z"/><path class="ta-object-line" d="M42 63h16M64 51h13"/>`,
  activities: `<path class="ta-object-soft" d="m17 96 64-9 27 17-66 5Z"/><path class="ta-object-paper" d="m31 35 43-8 10 58-43 8Z"/><path class="ta-object-line" d="m39 46 29-5m-27 15 29-5m-27 15 20-4"/><path class="ta-object-accent" d="m58 70 40-7 7 33-41 8Z"/><path class="ta-object-line" d="m68 78 23-4m-21 12 23-4"/>`,
  home: `<path class="ta-object-soft" d="m23 98 60-8 22 14-65 5Z"/><path class="ta-object-paper" d="M29 55h57v46H29Z"/><path class="ta-object-accent" d="m22 55 35-31 36 31Z"/><path class="ta-object-line" d="M50 101V73h16v28M34 63h11v12H34Zm38 0h9v12h-9"/>`,
  community: `<path class="ta-object-soft" d="m14 98 72-8 26 15-76 5Z"/><path class="ta-object-line" d="M29 53v47M91 53v47"/><path class="ta-object-paper" d="M23 28h74v50H23Z"/><path class="ta-object-accent" d="m31 36 24-3 3 31-24 3Z"/><path class="ta-object-soft" d="M64 41h25v28H64Z"/><path class="ta-object-line" d="m36 43 13-1m-12 8 13-1M69 48h14m-14 7h14M21 84h79"/>`,
  guiding: `<path class="ta-object-soft" d="m17 98 69-8 22 15-69 4Z"/><path class="ta-object-ink" d="M22 34h40v65H22Z"/><path class="ta-object-paper" d="M28 40h28v52H28Z"/><path class="ta-object-line" d="M34 50h15M34 57h15M34 64h9M94 67h10v19H92"/><path class="ta-object-accent" d="M65 58h29v42H65Z"/><path class="ta-object-line" d="M72 65h15"/>`
};


const profiles = [
  {
    id: 'professional', label: 'Professional with Shenzhen ties',
    hongkong: [
      {icon: 'rental', label: 'Rented home', layer: 'base'},
      {icon: 'university', label: 'University work', layer: 'base'}
    ],
    shenzhen: [
      {icon: 'property', label: 'Property', layer: 'connections'},
      {icon: 'family', label: 'Close family', layer: 'connections'},
      {icon: 'friends', label: 'Friends', layer: 'connections'},
      {icon: 'activities', label: 'Shopping & activities', layer: 'connections'}
    ],
    reflections: {
      all: 'She works and rents in Hong Kong, but described Shenzhen as home.',
      base: 'Her workplace and rented home are in Hong Kong.',
      connections: 'Property, family, friends and many activities connect her to Shenzhen.'
    },
    unplaced: ''
  },
  {
    id: 'guide', label: 'Guide who moved north',
    hongkong: [{icon: 'family', label: 'Family visits', layer: 'connections'}],
    shenzhen: [
      {icon: 'home', label: 'Home', layer: 'base'},
      {icon: 'community', label: 'Community life', layer: 'connections'},
      {icon: 'guiding', label: 'Guiding friendships', layer: 'connections'}
    ],
    reflections: {
      all: 'Moving home did not replace every connection.',
      base: 'Her home is in Shenzhen; her workplace is not established here.',
      connections: 'Community and guiding friendships in Shenzhen; family visits to Hong Kong.'
    },
    unplaced: 'Work location not established in this account.'
  }
];
const layers = [
  {id: 'all', label: 'All ties'},
  {id: 'base', label: 'Home & work'},
  {id: 'connections', label: 'Connections'}
];

function objectMarkup(item) {
  return `<li class="ta-tie ta-focused" data-ties-layer="${item.layer}"><div class="ta-object" aria-hidden="true"><svg viewBox="0 0 120 112" focusable="false">${objects[item.icon]}</svg></div><span class="ta-tie-label">${item.label}</span></li>`;
}

/** Fixed city placements depict reported ties, never a measured spatial network. */
export function initTiesAtlas(host) {
  if (!host) return {setProfile() { return false; }, setLayer() { return false; }, destroy() {}};
  const uid = `ties-atlas-${++tiesInstance}`;
  const shell = document.createElement('figure');
  shell.className = 'ta-atlas';
  shell.setAttribute('aria-labelledby', `${uid}-title`);
  shell.innerHTML = `<header class="ta-heading"><h3 id="${uid}-title">Two accounts · reported ties</h3></header>
    <div class="ta-toolbar">
      <div class="ta-switch" role="group" aria-label="Choose whose ties to explore">${profiles.map((profile, index) => `<button type="button" data-ties-profile="${profile.id}" aria-pressed="${index === 0}" aria-controls="${uid}-${profile.id}"><span class="ta-choice-mark" aria-hidden="true"></span>${profile.label}</button>`).join('')}</div>
      <div class="ta-focus" role="group" aria-label="Focus on a kind of tie">${layers.map((layer, index) => `<button type="button" data-ties-focus="${layer.id}" aria-pressed="${index === 0}">${layer.label}</button>`).join('')}</div>
    </div>
    <div class="ta-city-headings"><h4 id="${uid}-hongkong">Hong Kong</h4><h4 id="${uid}-shenzhen">Shenzhen</h4></div>
    <div class="ta-bundles">${profiles.map((profile, index) => `<div class="ta-bundle${index === 0 ? ' ta-active' : ''}" id="${uid}-${profile.id}" data-ties-bundle="${profile.id}" aria-hidden="${index !== 0}"${index === 0 ? '' : ' inert'}>
      <div class="ta-city" role="group" aria-labelledby="${uid}-hongkong"><ul class="ta-shelf" aria-label="${profile.label}: reported ties in Hong Kong">${profile.hongkong.map(objectMarkup).join('')}</ul></div>
      <div class="ta-city" role="group" aria-labelledby="${uid}-shenzhen"><ul class="ta-shelf" aria-label="${profile.label}: reported ties in Shenzhen">${profile.shenzhen.map(objectMarkup).join('')}</ul></div>
    </div>`).join('')}</div>
    <div class="ta-reading"><p class="ta-reflection">${profiles[0].reflections.all}</p><p class="ta-unplaced" hidden></p></div>
    <figcaption class="ta-caption">Selected accounts · symbols show kinds of ties, not their number or strength.</figcaption>
    <details class="ta-source"><summary>Source &amp; how to read this</summary><p>Paraphrases of two accounts in Jamie’s research, also discussed in the presentation. The professional works and rents in Hong Kong, while property, close family, friends and many activities connect her to Shenzhen. The guide moved home to Shenzhen and continues family visits to Hong Kong; her guiding workplace is not established.</p><p>Objects are conceptual symbols, not the participants’ possessions or portraits. City placement reflects reported connections, not measured frequency, distance, relationship strength or a representative population. The focus controls emphasise a kind of tie while keeping the full account in place; they do not show a sequence in time.</p></details>
    <p class="ta-status" role="status" aria-live="polite" aria-atomic="true"></p>`;
  host.replaceChildren(shell);

  const profileButtons = [...shell.querySelectorAll('[data-ties-profile]')];
  const layerButtons = [...shell.querySelectorAll('[data-ties-focus]')];
  const bundles = [...shell.querySelectorAll('[data-ties-bundle]')];
  const status = shell.querySelector('.ta-status');
  const reflection = shell.querySelector('.ta-reflection');
  const unplaced = shell.querySelector('.ta-unplaced');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 'professional';
  let focused = 'all';
  let paused = document.documentElement.dataset.motion === 'off';
  let destroyed = false;

  function syncMotion() {
    // Only selection emphasis changes. Symbols never move between cities.
    shell.classList.toggle('ta-motion-on', !paused && !reduced.matches);
  }
  function update(announce = true) {
    const profile = profiles.find(item => item.id === selected);
    profileButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tiesProfile === selected)));
    layerButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tiesFocus === focused)));
    bundles.forEach(bundle => {
      const active = bundle.dataset.tiesBundle === selected;
      bundle.classList.toggle('ta-active', active);
      bundle.setAttribute('aria-hidden', String(!active));
      bundle.toggleAttribute('inert', !active);
      bundle.querySelectorAll('[data-ties-layer]').forEach(item => item.classList.toggle('ta-focused', focused === 'all' || item.dataset.tiesLayer === focused));
    });
    reflection.textContent = profile.reflections[focused];
    unplaced.textContent = profile.unplaced;
    unplaced.hidden = !profile.unplaced || focused === 'base';
    if (announce) status.textContent = `${profile.label}. ${layers.find(layer => layer.id === focused).label}. ${profile.reflections[focused]}`;
  }
  function setProfile(id) {
    if (destroyed || !profiles.some(profile => profile.id === id)) return false;
    if (selected === id) return true;
    syncMotion();
    selected = id;
    update();
    return true;
  }
  function setLayer(id) {
    if (destroyed || !layers.some(layer => layer.id === id)) return false;
    if (focused === id) return true;
    syncMotion();
    focused = id;
    update();
    return true;
  }
  function click(event) {
    const button = event.target.closest('[data-ties-profile], [data-ties-focus]');
    if (!button || !shell.contains(button)) return;
    if (button.dataset.tiesProfile) setProfile(button.dataset.tiesProfile);
    else setLayer(button.dataset.tiesFocus);
  }
  function keydown(event) {
    const button = event.target.closest('[data-ties-profile], [data-ties-focus]');
    if (!button || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const group = button.dataset.tiesProfile ? profileButtons : layerButtons;
    const index = group.indexOf(button);
    if (index < 0) return;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? group.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + group.length) % group.length;
    event.preventDefault();
    group[next].focus();
    group[next].click();
  }
  function motion(event) { paused = Boolean(event.detail?.paused); syncMotion(); }
  function preference() { syncMotion(); }
  shell.addEventListener('click', click);
  shell.addEventListener('keydown', keydown);
  document.addEventListener('crossing:motion', motion);
  reduced.addEventListener('change', preference);

  return {
    setProfile, setLayer,
    destroy() {
      destroyed = true;
      shell.removeEventListener('click', click);
      shell.removeEventListener('keydown', keydown);
      document.removeEventListener('crossing:motion', motion);
      reduced.removeEventListener('change', preference);
      shell.remove();
    }
  };
}
