let tiesInstance = 0;

// Original miniature symbols. These depict categories of ties, not possessions,
// photographed places, people, routes, or the quantity/strength of a relationship.
const objects = {
  rental: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="43" ry="5"/><rect class="ta-object-soft" x="31" y="20" width="54" height="77" rx="11"/><rect class="ta-object-paper" x="23" y="16" width="54" height="81" rx="11"/><path class="ta-object-ink" d="M38 96V54a13 13 0 0 1 26 0v42Z"/><path class="ta-object-highlight" d="M30 35v-7a5 5 0 0 1 5-5h27"/><rect class="ta-object-soft" x="38" y="25" width="25" height="6" rx="3"/><circle class="ta-object-paper" cx="57" cy="69" r="2.3"/><path class="ta-object-accent" d="M82 75h7v9h9v7h-9v8h-7Z"/><circle class="ta-object-accent" cx="85.5" cy="66" r="11"/><circle class="ta-object-paper" cx="85.5" cy="66" r="3.5"/>`,
  university: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="45" ry="5"/>
    <rect class="ta-object-soft" x="31" y="43" width="67" height="51" rx="5"/>
    <rect class="ta-object-paper" x="24" y="43" width="67" height="51" rx="5"/>
    <path class="ta-object-ink" d="m19 40 36-23a7 7 0 0 1 8 0l36 23a3 3 0 0 1-2 6H21a3 3 0 0 1-2-6Z"/>
    <circle class="ta-object-paper" cx="59" cy="32" r="5"/>
    <rect class="ta-object-soft" x="34" y="51" width="8" height="36" rx="3"/>
    <rect class="ta-object-soft" x="54" y="51" width="8" height="36" rx="3"/>
    <rect class="ta-object-soft" x="74" y="51" width="8" height="36" rx="3"/>
    <rect class="ta-object-paper" x="21" y="88" width="76" height="9" rx="3"/>
    <g transform="rotate(-8 39 93)"><rect class="ta-object-accent" x="17" y="82" width="40" height="18" rx="4"/><path class="ta-object-paper" d="M24 87h32v8H24a4 4 0 0 1 0-8Z"/><path class="ta-object-line" d="M29 91h22"/></g>`,
  property: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="42" ry="5"/>
    <path class="ta-object-line" d="M48 27c20-18 46-1 37 23"/>
    <path class="ta-object-soft" d="M68 55 81 44a6 6 0 0 1 8 0l13 11a6 6 0 0 1 2 5v30a6 6 0 0 1-6 6H72a6 6 0 0 1-6-6V60a6 6 0 0 1 2-5Z"/>
    <circle class="ta-object-paper" cx="85" cy="54" r="3"/>
    <path class="ta-object-paper" d="M77 96V77a8 8 0 0 1 16 0v19Z"/>
    <path class="ta-object-highlight" d="M72 66v20"/>
    <path class="ta-object-accent" d="M34 49h10v24h15v9H44v13H34Z"/>
    <circle class="ta-object-accent" cx="39" cy="35" r="19"/>
    <circle class="ta-object-paper" cx="39" cy="35" r="8"/>
    <path class="ta-object-highlight" d="M27 32a13 13 0 0 1 9-9"/>`,
  family: `<ellipse class="ta-object-shadow" cx="60" cy="102" rx="45" ry="5"/>
    <path class="ta-object-soft" d="M18 95V78a19 19 0 0 1 38 0v17a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5Z"/>
    <circle class="ta-object-paper" cx="37" cy="46" r="14"/>
    <path class="ta-object-ink" d="M67 99a5 5 0 0 1-5-5V77a19 19 0 0 1 38 0v17a5 5 0 0 1-5 5Z"/>
    <circle class="ta-object-paper" cx="81" cy="45" r="14"/>
    <path class="ta-object-accent" d="M45 96V84a15 15 0 0 1 30 0v12a5 5 0 0 1-5 5H50a5 5 0 0 1-5-5Z"/>
    <circle class="ta-object-paper" cx="60" cy="61" r="11"/>
    <path class="ta-object-accent" d="M53 20c-7-9-18 1-9 9l9 8 9-8c9-8-2-18-9-9Z"/>
    <path class="ta-object-highlight" d="M25 78v12M68 84v9"/>`,
  friends: `<ellipse class="ta-object-shadow" cx="62" cy="101" rx="45" ry="5"/><path class="ta-object-soft" d="M87 47h7a12 12 0 0 1 0 24h-8v-7h8a5 5 0 0 0 0-10h-7Z"/><path class="ta-object-soft" d="M58 40h33v26a16.5 16.5 0 0 1-33 0Z"/><ellipse class="ta-object-paper" cx="74.5" cy="40" rx="16.5" ry="5"/><ellipse class="ta-object-ink" cx="74.5" cy="40" rx="11.5" ry="2.3"/><path class="ta-object-highlight" d="M65 50v14c0 5 2 8 5 10"/><path class="ta-object-paper" d="M31 64h-8a12 12 0 0 0 0 24h8v-7h-8a5 5 0 0 1 0-10h8Z"/><path class="ta-object-accent" d="M28 57h35v25a17.5 17.5 0 0 1-35 0Z"/><ellipse class="ta-object-paper" cx="45.5" cy="57" rx="17.5" ry="5"/><ellipse class="ta-object-ink" cx="45.5" cy="57" rx="12.5" ry="2.3"/><path class="ta-object-highlight" d="M35 67v13c0 5 2 8 5 10"/><path class="ta-object-line" d="M41 43c-7-7 7-9 1-17M72 26c-6-6 6-8 1-14"/>`,
  activities: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="43" ry="5"/>
    <g transform="rotate(12 84 52)"><path class="ta-object-paper" d="M72 22h26a4 4 0 0 1 4 4v13a6 6 0 0 0 0 12v28a4 4 0 0 1-4 4H72a4 4 0 0 1-4-4V51a6 6 0 0 0 0-12V26a4 4 0 0 1 4-4Z"/><path class="ta-object-line" d="M76 34h18M76 61h18M76 68h12"/><circle class="ta-object-accent" cx="85" cy="47" r="4"/></g>
    <path class="ta-object-accent" d="M28 44h44a6 6 0 0 1 6 5l5 45a6 6 0 0 1-6 7H23a6 6 0 0 1-6-7l5-45a6 6 0 0 1 6-5Z"/>
    <path class="ta-object-paper" d="M35 44V32a15 15 0 0 1 30 0v12h-7V32a8 8 0 0 0-16 0v12Z"/>
    <path class="ta-object-highlight" d="m30 55-4 34"/>
    <path class="ta-object-paper" d="M43 65h15v15H43Z"/>
    <path class="ta-object-line" d="m47 72 3 3 5-6"/>`,
  home: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="43" ry="5"/>
    <rect class="ta-object-soft" x="77" y="25" width="13" height="30" rx="4"/>
    <path class="ta-object-soft" d="M37 51h60v43a7 7 0 0 1-7 7H44a7 7 0 0 1-7-7Z"/>
    <path class="ta-object-paper" d="M25 49h63v45a7 7 0 0 1-7 7H32a7 7 0 0 1-7-7Z"/>
    <path class="ta-object-accent" d="m17 45 35-28a7 7 0 0 1 9 0l37 28a6 6 0 0 1-7 10L57 29 24 55a6 6 0 0 1-7-10Z"/>
    <path class="ta-object-highlight" d="m27 43 26-21"/>
    <path class="ta-object-ink" d="M47 101V78a10 10 0 0 1 20 0v23Z"/>
    <rect class="ta-object-soft" x="34" y="56" width="12" height="12" rx="3"/>
    <rect class="ta-object-soft" x="68" y="56" width="12" height="12" rx="3"/>
    <circle class="ta-object-paper" cx="60" cy="84" r="2"/>`,
  community: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="46" ry="5"/>
    <path class="ta-object-line" d="M91 64v34"/>
    <path class="ta-object-soft" d="M78 59c-13-5-9-20 1-23-2-17 24-22 27-5 15 3 15 23 3 27-4 9-22 12-31 1Z"/>
    <path class="ta-object-line" d="m91 72-9-10m9 1 10-10"/>
    <rect class="ta-object-paper" x="22" y="65" width="61" height="14" rx="4"/>
    <path class="ta-object-line" d="M26 87v14M77 87v14"/>
    <rect class="ta-object-soft" x="19" y="81" width="67" height="7" rx="3"/>
    <path class="ta-object-accent" d="M26 79V65a12 12 0 0 1 24 0v14Z"/>
    <circle class="ta-object-paper" cx="38" cy="41" r="10"/>
    <path class="ta-object-ink" d="M52 79V65a12 12 0 0 1 24 0v14Z"/>
    <circle class="ta-object-paper" cx="64" cy="41" r="10"/>
    <path class="ta-object-line" d="M32 88v10h8M64 88v10h8"/>
    <path class="ta-object-highlight" d="M31 65v8"/>`,
  guiding: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="43" ry="5"/>
    <path class="ta-object-paper" d="M18 96V81a16 16 0 0 1 32 0v15a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5Z"/>
    <circle class="ta-object-paper" cx="34" cy="53" r="12"/>
    <path class="ta-object-soft" d="M49 96V77a18 18 0 0 1 36 0v19a5 5 0 0 1-5 5H54a5 5 0 0 1-5-5Z"/>
    <circle class="ta-object-paper" cx="67" cy="45" r="13"/>
    <path class="ta-object-accent" d="M96 17h-22a4 4 0 0 0-3 6l5 7-5 7a4 4 0 0 0 3 6h22Z"/>
    <path class="ta-object-line" d="M96 14v84M82 76h14"/>
    <circle class="ta-object-ink" cx="96" cy="13" r="3"/>
    <path class="ta-object-highlight" d="M56 76v15"/>
    <path class="ta-object-line" d="m60 61 7 10 7-10"/>
    <rect class="ta-object-paper" x="63" y="74" width="8" height="12" rx="2"/>`
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
