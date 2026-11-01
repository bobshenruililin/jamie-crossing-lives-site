let tiesInstance = 0;

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
  return `<li class="ta-tie"><span class="ta-tie-label">${item.label}</span><span class="ta-tie-detail">${item.detail}</span></li>`;
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
    <div class="ta-concept"><img src="${new URL('./assets/relationships-concept.png', import.meta.url).href}" alt="" width="1536" height="1024" loading="lazy"><p>AI-generated illustration · a conceptual connection, not actual places or possessions</p></div>
    <div class="ta-city-headings"><h4 id="${uid}-hongkong">Hong Kong</h4><h4 id="${uid}-shenzhen">Shenzhen</h4></div>
    <div class="ta-bundles">${profiles.map((profile, index) => `<div class="ta-bundle${index === 0 ? ' ta-active' : ''}" id="${uid}-${profile.id}" data-ties-bundle="${profile.id}" aria-hidden="${index !== 0}"${index === 0 ? '' : ' inert'}>
      <div class="ta-city" role="group" aria-labelledby="${uid}-hongkong"><ul class="ta-shelf" aria-label="${profile.label}: reported ties in Hong Kong">${profile.hongkong.map(objectMarkup).join('')}</ul></div>
      <div class="ta-city" role="group" aria-labelledby="${uid}-shenzhen"><ul class="ta-shelf" aria-label="${profile.label}: reported ties in Shenzhen">${profile.shenzhen.map(objectMarkup).join('')}</ul></div>
      <div class="ta-reading"><p class="ta-reflection">${profile.reflection}</p>${profile.unplaced ? `<p class="ta-unplaced"><span aria-hidden="true">?</span>${profile.unplaced}</p>` : ''}</div>
    </div>`).join('')}</div>
    <figcaption class="ta-caption"><span>Paraphrases of two participant accounts · source [7] in the presentation.</span><span>The generated illustration is conceptual. The lists show reported ties, not their number, strength or frequency. These accounts are not representative.</span></figcaption>
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
