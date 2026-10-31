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
      {icon: 'rental', label: 'Rental housing', detail: 'Lives in Hong Kong'},
      {icon: 'university', label: 'University work', detail: 'Works in Hong Kong'}
    ],
    shenzhen: [
      {icon: 'property', label: 'Property', detail: 'Keeps property here'},
      {icon: 'family', label: 'Close family', detail: 'Ties in Shenzhen'},
      {icon: 'friends', label: 'Friends', detail: 'Ties in Shenzhen'},
      {icon: 'activities', label: 'Many activities', detail: 'Including shopping'}
    ],
    reflection: 'She described Shenzhen as home, while working and renting in Hong Kong.',
    unplaced: ''
  },
  {
    id: 'guide', label: 'Guide who moved north',
    hongkong: [{icon: 'family', label: 'Family visits', detail: 'Continues to visit'}],
    shenzhen: [
      {icon: 'home', label: 'Home', detail: 'Moved from Hong Kong'},
      {icon: 'community', label: 'Community life', detail: 'Much is centred here'},
      {icon: 'guiding', label: 'Guiding friendships', detail: 'Many are centred here'}
    ],
    reflection: 'Moving home did not replace all her important relationships.',
    unplaced: 'Guiding work: its location is not established in this account.'
  }
];

function objectMarkup(item) {
  return `<li class="ta-tie"><div class="ta-object" aria-hidden="true"><svg viewBox="0 0 120 112" focusable="false">${objects[item.icon]}</svg></div><span class="ta-tie-label">${item.label}</span><span class="ta-tie-detail">${item.detail}</span></li>`;
}

/** Two illustrative accounts; no remote data, route model or quantitative scale. */
export function initTiesAtlas(host) {
  if (!host) return {setProfile() { return false; }, destroy() {}};
  const uid = `ties-atlas-${++tiesInstance}`;
  const shell = document.createElement('figure');
  shell.className = 'ta-atlas';
  shell.setAttribute('aria-labelledby', `${uid}-title`);
  shell.innerHTML = `<header class="ta-heading"><p class="ta-kicker">Two individual accounts</p><h3 id="${uid}-title">Where life stays connected</h3></header>
    <div class="ta-switch" role="group" aria-label="Choose whose ties to explore">${profiles.map((profile, index) => `<button type="button" data-ties-profile="${profile.id}" aria-pressed="${index === 0}" aria-controls="${uid}-${profile.id}"><span class="ta-choice-mark" aria-hidden="true"></span>${profile.label}</button>`).join('')}</div>
    <div class="ta-city-headings"><h4 id="${uid}-hongkong">Hong Kong</h4><h4 id="${uid}-shenzhen">Shenzhen</h4></div>
    <div class="ta-bundles">${profiles.map((profile, index) => `<div class="ta-bundle${index === 0 ? ' ta-active' : ''}" id="${uid}-${profile.id}" data-ties-bundle="${profile.id}" aria-hidden="${index !== 0}"${index === 0 ? '' : ' inert'}>
      <div class="ta-city" role="group" aria-labelledby="${uid}-hongkong"><ul class="ta-shelf" aria-label="${profile.label}: reported ties in Hong Kong">${profile.hongkong.map(objectMarkup).join('')}</ul></div>
      <div class="ta-city" role="group" aria-labelledby="${uid}-shenzhen"><ul class="ta-shelf" aria-label="${profile.label}: reported ties in Shenzhen">${profile.shenzhen.map(objectMarkup).join('')}</ul></div>
      <div class="ta-reading"><p class="ta-reflection">${profile.reflection}</p>${profile.unplaced ? `<p class="ta-unplaced"><span aria-hidden="true">?</span>${profile.unplaced}</p>` : ''}</div>
    </div>`).join('')}</div>
    <figcaption class="ta-caption"><span>Paraphrases of two participant accounts · source [7] in the presentation.</span><span>Illustrated symbols, not participants’ possessions. Placement shows reported ties, not their number, strength or frequency. These accounts are not representative.</span></figcaption>
    <p class="ta-status" role="status" aria-live="polite" aria-atomic="true"></p>`;
  host.replaceChildren(shell);

  const buttons = [...shell.querySelectorAll('[data-ties-profile]')];
  const bundles = [...shell.querySelectorAll('[data-ties-bundle]')];
  const status = shell.querySelector('.ta-status');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 'professional';
  let paused = document.documentElement.dataset.motion === 'off';
  let destroyed = false;

  function syncMotion() {
    // The initial composition is static. Enable only the following selection's
    // opacity transition; no object changes position or moves across a border.
    shell.classList.toggle('ta-motion-on', !paused && !reduced.matches);
  }
  function setProfile(id) {
    const profile = profiles.find(item => item.id === id);
    if (!profile || destroyed) return false;
    if (selected === id) return true;
    syncMotion();
    selected = id;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tiesProfile === id)));
    bundles.forEach(bundle => {
      const active = bundle.dataset.tiesBundle === id;
      bundle.classList.toggle('ta-active', active);
      bundle.setAttribute('aria-hidden', String(!active));
      bundle.toggleAttribute('inert', !active);
    });
    status.textContent = `${profile.label}. ${profile.reflection}${profile.unplaced ? ` ${profile.unplaced}` : ''}`;
    return true;
  }
  function click(event) {
    const button = event.target.closest('[data-ties-profile]');
    if (button && shell.contains(button)) setProfile(button.dataset.tiesProfile);
  }
  function motion(event) { paused = Boolean(event.detail?.paused); syncMotion(); }
  function preference() { syncMotion(); }
  shell.addEventListener('click', click);
  document.addEventListener('crossing:motion', motion);
  reduced.addEventListener('change', preference);

  return {
    setProfile,
    destroy() {
      destroyed = true;
      shell.removeEventListener('click', click);
      document.removeEventListener('crossing:motion', motion);
      reduced.removeEventListener('change', preference);
      shell.remove();
    }
  };
}
