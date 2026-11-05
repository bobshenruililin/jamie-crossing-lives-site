/* Crossing Lives — the public-safe cast, places and evidence grammar.
   One source of truth for the miniature, the ledger and the three lenses.

   Wording is paraphrased from material already public in this repository:
   the Script v3 presentation frames (checked 2 November 2026) and the earlier
   website edition. No quotations, private identifiers, employers, institutions
   or invented values. "Not established" means the public account does not say.
   Pronouns follow the earlier public edition; otherwise wording stays neutral. */

export const EVIDENCE = {
  account:   { label: 'Account',          long: 'Reported in a conversation · paraphrased' },
  observed:  { label: 'Observed',         long: 'Seen or photographed during fieldwork' },
  published: { label: 'Published figure', long: 'Official statistics, programme records or research data' },
  forecast:  { label: 'Forecast',         long: 'A projection, not realised activity' },
  question:  { label: 'Question',         long: 'A hypothesis or proposal to investigate' },
  unknown:   { label: 'Not established',  long: 'The account does not say' }
};

export const FACETS = {
  home:  { label: 'Home',                    short: 'Home' },
  work:  { label: 'Work or school',          short: 'Work' },
  spend: { label: 'Purchases and services',  short: 'Purchases' },
  ties:  { label: 'Relationships and activities', short: 'Ties' }
};

export const SIDES = { hk: 'Hong Kong', sz: 'Shenzhen' };

/* Arrangement vocabulary from Script v3, section 3. Arrangements overlap. */
export const ARRANGEMENTS = {
  user:   { n: '01', label: 'Cross-border user',              gloss: 'Based mainly on one side; selected activities across the border.' },
  mover:  { n: '02', label: 'Northbound mover',               gloss: 'Home moves from Hong Kong to Shenzhen.' },
  worker: { n: '03', label: 'Cross-border worker or student', gloss: 'Lives on one side; works or studies on the other.' },
  base:   { n: '04', label: 'Hong Kong base, Mainland ties',  gloss: 'Based in Hong Kong, with property, relationships or activities across.' },
  local:  { n: '—',  label: 'Locally based',                  gloss: 'Based near the border; crossing is occasional.' },
  unplaced: { n: '',  label: 'Arrangement not established',   gloss: 'The account does not say where the person lives or works.' }
};

const FIELD = 'Jamie Ko’s fieldwork · paraphrased';
const SHEUNG_SHUI = 'Sheung Shui walk and brief chats, 31 October 2026 · paraphrased';

/* Each facet lists what the account places on each side.
   hk / sz: short phrases. mainland: a Mainland placement that is not Shenzhen. note: a qualification that travels with the facet.
   A facet with neither side is drawn as "not established". */
export const cast = [
  {
    id: 'repair', name: 'Repair customer', arrangement: 'user', evidence: 'account', source: FIELD,
    pronoun: 'he',
    summary: 'He took older equipment to Shenzhen because suitable parts and expertise were hard to find in Hong Kong.',
    facets: {
      home: {}, work: {},
      spend: { sz: 'Specialist parts and repair', note: 'Parts were hard to find in Hong Kong, in his account.' },
      ties: {}
    },
    limit: 'His reason for crossing. Where he lives and works, and how often he crosses, are not established.'
  },
  {
    id: 'dining', name: 'Dining visitors', arrangement: 'user', evidence: 'account', source: `${FIELD} · group conversation during a Shenzhen outing`,
    summary: 'Visitors dining in Shenzhen described choice, space and price—and the activities they join in Hong Kong.',
    facets: {
      home: {}, work: {},
      spend: { sz: 'Meals out: choice, space, price', note: 'Online options when local shops lack stock.' },
      ties: { hk: 'Sport, volunteering, animal activities', note: 'Sports leagues and coaching, volunteering, animal activities and beach cleaning—all in Hong Kong.' }
    },
    limit: 'The activities they described are in Hong Kong, although the conversation took place in Shenzhen.'
  },
  {
    id: 'guide', name: 'Guide who moved north', arrangement: 'mover', evidence: 'account', source: FIELD,
    pronoun: 'she',
    summary: 'She moved home to Shenzhen, weighing lower earnings against lower living costs and preferred guiding work.',
    facets: {
      home: { sz: 'Moved home from Hong Kong', note: 'Lower living costs, in her account; she prepared before moving.' },
      work: { note: 'Preferred guiding work; its location is not established.' },
      spend: {},
      ties: { hk: 'Family visits', sz: 'Community life and guiding friends', note: 'Sports, interest groups and food-related activities too. Mandarin helped her join in, in her view.' }
    },
    limit: 'Her account of a trade-off, not an audited budget or a general benefit of moving.'
  },
  {
    id: 'pupils', name: 'Cross-boundary schoolchildren', arrangement: 'worker', evidence: 'published',
    source: 'Education Bureau, 2026/27 Estimates, annex table 1 · September 2024 snapshot',
    figure: { value: '16,139', label: 'pupils travelling daily, 2024/25' },
    summary: 'Official data count 16,139 pupils who live on the Mainland side and travel daily to school in Hong Kong.',
    facets: {
      home: { mainland: 'Mainland residence—not only Shenzhen' },
      work: { hk: 'School in Hong Kong' },
      spend: {}, ties: {}
    },
    notCovered: ['spend', 'ties'],
    limit: 'Official evidence, not an interviewed account. Pupils, not crossing events or workers.'
  },
  {
    id: 'resident', name: 'Resident with Shenzhen ties', arrangement: 'base', evidence: 'account', source: FIELD,
    pronoun: 'she',
    summary: 'She works and rents in Hong Kong. Property, close family, friends and many activities connect her to Shenzhen, which she described as home.',
    facets: {
      home: { hk: 'Rents in Hong Kong', sz: 'Property; described as home' },
      work: { hk: 'Works in Hong Kong' },
      spend: { sz: 'Shopping and many activities' },
      ties: { sz: 'Close family and friends' }
    },
    limit: 'A regular cross-border commute is not established. Property is her explanation of home, not a measure of time spent.'
  },
  {
    id: 'manager', name: 'Sheung Shui store manager', arrangement: 'local', evidence: 'account', source: SHEUNG_SHUI,
    pronoun: 'she',
    summary: 'She lives in Fanling, works in Sheung Shui and visits Shenzhen about once a month, mainly for meals. Most shopping stays in Hong Kong.',
    facets: {
      home: { hk: 'Fanling' },
      work: { hk: 'Sheung Shui' },
      spend: { hk: 'Most shopping', sz: 'Meals, about monthly' },
      ties: {}
    },
    customers: 'Locals and Mainland visitors, busier Monday to Thursday, as she described them.',
    limit: 'Reported visit frequency, shopping and customer patterns—not transaction or footfall data.'
  },
  {
    id: 'ss-resident', name: 'Sheung Shui resident', arrangement: 'local', evidence: 'account', source: SHEUNG_SHUI,
    summary: 'A resident living near the border visits Shenzhen infrequently; crowding limits their crossings.',
    facets: {
      home: { hk: 'Near the border, Sheung Shui' },
      work: {},
      spend: { sz: 'Infrequent visits', note: 'Crowding limits crossings, in this account.' },
      ties: {}
    },
    limit: 'One brief chat, not a local sample.'
  },
  {
    id: 'ss-employee', name: 'Sheung Shui shop employee', arrangement: 'local', evidence: 'account', source: SHEUNG_SHUI,
    summary: 'An employee at an estate shop described mainly nearby residents as customers, with few tourists.',
    facets: {
      home: {},
      work: { hk: 'Estate shop, Sheung Shui' },
      spend: {}, ties: {}
    },
    limit: 'A reported customer mix, not a measured market share.'
  },
  {
    id: 'parent', name: 'Parent', arrangement: 'unplaced', evidence: 'account', source: 'A parent’s personal account · paraphrased',
    summary: 'Their child’s Hong Kong activities leave little time. With childcare arranged and half a day free, a Shenzhen visit might be workable.',
    facets: {
      home: {}, work: {},
      spend: { note: 'Might visit with childcare and half a day free.' },
      ties: { hk: 'Child’s activities fill the time' }
    },
    limit: 'A personal account of time constraints, not a household category.'
  }
];

export const byId = Object.fromEntries(cast.map(person => [person.id, person]));

/* Field photographs already published in this repository (feature/assets).
   rects are normalised [x, y, w, h] on the unchanged original. */
export const photos = {
  'driving-school': {
    file: 'ss-driving-school.jpg', width: 1200, height: 1600, where: 'Sheung Shui',
    alt: 'A driving school storefront with a red sign advertising conversion to Mainland and Hong Kong driving licences.',
    caption: 'Driving-licence conversion advertised at a Sheung Shui driving school.',
    limit: 'Advertising, not evidence of completed applications. Licence conversion, not vehicle plates.',
    spots: [{ label: 'Conversion sign', rect: [.123, .516, .202, .244], note: 'The red sign advertises Mainland and Hong Kong licence conversion.' }]
  },
  'help-point': {
    file: 'sz-wayfinding.jpg', width: 1536, height: 2048, where: 'Futian Port',
    alt: 'A rack holds guides in several languages beneath the Futian Port Inbound Service Center sign.',
    caption: 'Guides on display at the Futian Port Inbound Service Center.',
    limit: 'The operator is unconfirmed; described referrals were not tested.',
    spots: [
      { label: 'Centre name', rect: [.244, .054, .523, .050], note: 'Futian Port Inbound Service Center.' },
      { label: 'Language guides', rect: [.269, .247, .445, .126], note: 'Korean, Japanese and Spanish guides share a row. Printed languages do not establish staff language support.' }
    ]
  },
  'transit-maps': {
    file: 'sz-transit-maps.jpg', width: 2048, height: 1536, where: 'Shenzhen',
    alt: 'Printed Shenzhen rail and MTR system maps displayed side by side above information brochures.',
    caption: 'Shenzhen rail and MTR maps displayed together at an information point.',
    limit: 'Information on display. It does not establish the information point’s operator or the help received.',
    spots: []
  },
  'service-street': {
    // Signage-only derivative of a field photograph: the original's identifiable
    // foreground person has no recorded consent, so only this crop is published.
    file: 'sz-services-signage.jpg', width: 1600, height: 252, where: 'Shenzhen',
    alt: 'Signs for dental, courier and mobile-phone services above a row of Shenzhen storefronts.',
    caption: 'Dental, courier and mobile-phone signs along one Shenzhen street.',
    limit: 'Signs show what is offered, not who uses it, prices or quality.',
    spots: [
      { label: 'Dental', rect: [.071, .576, .262, .357], note: 'Dental services advertised above the street.' },
      { label: 'Courier', rect: [.368, .610, .236, .348], note: 'Courier signage above a storefront.' },
      { label: 'Mobile', rect: [.649, .619, .303, .367], note: 'China Mobile signage identifies another everyday service.' }
    ]
  },
  'parcels': {
    file: 'sz-parcels.jpg', width: 1200, height: 1600, where: 'Shenzhen',
    alt: 'A small neighbourhood parcel pickup storefront with shelves and everyday objects.',
    caption: 'A neighbourhood parcel pickup storefront.',
    limit: 'The storefront does not establish parcel flows, customers or frequency of use.',
    spots: []
  },
  'menu': {
    file: 'sz-meals.jpg', width: 1200, height: 1600, where: 'Shenzhen',
    alt: 'A food-stall sign advertises meal combinations at 16 and 20 yuan.',
    caption: 'A posted menu offers two combinations, at 16 and 20 yuan.',
    limit: 'One photographed sign with an unverified capture date—not a price list or a cost-of-living comparison.',
    spots: []
  },
  'community-sign': {
    file: 'sz-community-sign.jpg', width: 1200, height: 1600, where: 'Shenzhen',
    alt: 'A sign beside a planted frontage names Lianhua Ercun Community Public Service Center and points left.',
    caption: 'A sign points toward Lianhua Ercun’s community public service centre.',
    limit: 'The sign identifies a place, not eligibility, staffing, users or outcomes.',
    spots: []
  },
  'park': {
    file: 'sz-park.jpg', width: 1200, height: 1600, where: 'Shenzhen',
    alt: 'Trees shade grass beside a waterside footpath, with a few distant people walking.',
    caption: 'Trees, water and a walking path on the Shenzhen field trip.',
    limit: 'The exact park and capture date are unverified. No pictured person is a participant.',
    spots: []
  },
  // Approved 6 November 2026 from the field-photo shortlist. Derivatives (resized;
  // two cropped to exclude people). Captions describe visible signage only.
  'crossing-hall': {
    file: 'hk-crossing-hall.jpg', width: 1050, height: 1400, where: 'The crossing',
    alt: 'A wide, bright crossing hall with lifts and pillars beneath a sign pointing left to Futian Port and HSITP.',
    caption: 'A crossing hall; a sign points to “Futian Port / HSITP”.',
    limit: 'Exact station and capture date are not verified. No pictured person is a participant.',
    spots: [{ label: 'Direction sign', rect: [.39, .36, .19, .05], note: 'The sign reads 福田口岸 / 港深創科園 — Futian Port / HSITP.' }]
  },
  'hsitp-sign': {
    file: 'hk-hsitp-sign.jpg', width: 1400, height: 294, where: 'The crossing',
    alt: 'Signs reading No Entry and Elevated Public Transport Interchange (To HSITP), Authorised Persons Only.',
    caption: 'Signs at the crossing: “Elevated Public Transport Interchange (To HSITP) · Authorised Persons Only”.',
    limit: 'A signage-only crop. It shows wayfinding, not who may use the route or how often.',
    spots: []
  },
  'help-kiosk': {
    file: 'sz-help-kiosk.jpg', width: 696, height: 1200, where: 'Futian Port',
    alt: 'Posters at the Futian Port Inbound Service Center advertise company registration and start-up support, and invite Hong Kong volunteers.',
    caption: 'At the Futian Port Inbound Service Center: posters for company registration and start-up support, and for Hong Kong volunteers.',
    limit: 'Advertised services and a recruitment poster, not evidence of uptake or outcomes. Cropped to the posters.',
    spots: [
      { label: 'Start-up support', rect: [.06, .04, .52, .37], note: '公司注冊 · 創業援助 — company registration and entrepreneurship support, with business matching, shop consultation, resources and free support listed.' },
      { label: 'Volunteers', rect: [.06, .52, .52, .44], note: '來了就是「深圳人」· 港人義工申請 — a poster inviting Hong Kong people to apply as volunteers.' }
    ]
  },
  'police-office': {
    file: 'sz-police-office.jpg', width: 1050, height: 1400, where: 'Shenzhen',
    alt: 'A sign beside a planted wall points to the Lian Hua Er Cun Community Police Affairs Office.',
    caption: 'A sign points to the Lianhua Ercun community police affairs office.',
    limit: 'The sign identifies a place, not its services, users or outcomes.',
    spots: []
  },
  'community-centre': {
    file: 'sz-community-centre.jpg', width: 1050, height: 1400, where: 'Shenzhen',
    alt: 'The Lianhua Ercun Community Public Service Center, with a flag and bulletin boards in front.',
    caption: 'The Lianhua Ercun Community Public Service Center.',
    limit: 'A photographed building and its signage; services, eligibility and users are not established.',
    spots: []
  },
  'place': {
    file: 'sz-place.jpg', width: 1200, height: 1600, where: 'Shenzhen',
    alt: 'Glass towers rise beyond an elevated walkway and a broad, tree-lined road.',
    caption: 'Glass towers, a raised walkway and the street below.',
    limit: 'Building names and street location are not verified. It does not establish land use, prices or how typical the streetscape is.',
    spots: []
  },
  'jb-concourse': {
    file: 'sgj-concourse.jpg', width: 1200, height: 1600, where: 'Johor Bahru',
    alt: 'A concourse with pedestrians and signs toward Bangunan Sultan Iskandar and Woodlands.',
    caption: 'Singapore–Johor visit · a concourse with directions toward Woodlands.',
    limit: 'A separate visit from the Shenzhen fieldwork. No pictured person is a participant.',
    spots: []
  }
};

/* The miniature's places. Positions are authored for explanation; this is
   not a map. Each place says why it is in the model: an account, an
   observation or a published figure. `who` links accounts to the place. */
export const places = [
  // Hong Kong side
  { id: 'hk-work',     side: 'hk', kind: 'tower',    label: 'A workplace',            who: { resident: 'Works in Hong Kong' } },
  { id: 'hk-rental',   side: 'hk', kind: 'slab',     label: 'A rented flat',          who: { resident: 'Rents here' } },
  { id: 'hk-fanling',  side: 'hk', kind: 'estate',   label: 'Homes in Fanling',       who: { manager: 'Home in Fanling' } },
  { id: 'hk-family',   side: 'hk', kind: 'house',    label: 'Family in Hong Kong',    who: { guide: 'Family visits continue' } },
  { id: 'hk-shops',    side: 'hk', kind: 'mall',     label: 'Shops in Sheung Shui',   who: { manager: 'Works here', 'ss-employee': 'An estate shop' },
    observed: 'Walking observations in Sheung Shui on 31 October 2026 noted familiar chains—a question to test, not a survival finding.' },
  { id: 'hk-licence',  side: 'hk', kind: 'shop',     label: 'Licence conversion',     photo: 'driving-school', observed: 'A Sheung Shui driving school advertises Mainland and Hong Kong licence conversion.' },
  { id: 'hk-school',   side: 'hk', kind: 'school',   label: 'Schools',                who: { pupils: '16,139 daily pupils' } },
  { id: 'hk-pitch',    side: 'hk', kind: 'pitch',    label: 'Sport, volunteering and the shore', who: { dining: 'Sports, coaching, volunteering, beach cleaning', parent: 'A child’s activities' } },
  // The crossing
  { id: 'crossing',    side: 'x',  kind: 'gate',     label: 'The crossing',           photo: 'help-point',
    observed: 'At Futian, immigration staff helped with the arrival form. A separate help point offered information and described referrals; its operator was unconfirmed and referrals were not tested.' },
  // Shenzhen side
  { id: 'sz-repair',   side: 'sz', kind: 'market',   label: 'Repair specialists',     who: { repair: 'Specialist parts and repair' } },
  { id: 'sz-dining',   side: 'sz', kind: 'restaurant', label: 'Restaurants',          photo: 'menu', photoNote: 'A menu photographed on a Shenzhen street—context, not a restaurant these accounts describe.', who: { manager: 'Meals, about monthly', dining: 'Choice, space, price' },
    reported: 'A property agent described restaurants catering to Hong Kong tastes.' },
  { id: 'sz-tower',    side: 'sz', kind: 'tower',    label: 'Family, friends, property', who: { resident: 'Property; family; friends' } },
  { id: 'sz-leisure',  side: 'sz', kind: 'mall',     label: 'Shops and leisure',      who: { resident: 'Shopping and many activities' } },
  { id: 'sz-home',     side: 'sz', kind: 'house',    label: 'A new home',             who: { guide: 'Moved home here' } },
  { id: 'sz-street',   side: 'sz', kind: 'street',   label: 'A street of services',   photo: 'service-street', photoNote: 'Signs photographed in Shenzhen; no account links to this street.', observed: 'Dental, courier and mobile-phone storefronts were photographed along one street; a parcel pickup point nearby.' },
  { id: 'sz-clinic',   side: 'sz', kind: 'clinic',   label: 'Follow-up clinic',       published: 'More than 5,900 eligible Hospital Authority patients had joined a follow-up consultation pilot at HKU–Shenzhen Hospital by January 2026.' },
  { id: 'sz-tuition',  side: 'sz', kind: 'tuition',  label: 'Tuition',                reported: 'A property agent described tuition in Shenzhen for Hong Kong-curriculum students.' },
  { id: 'sz-community',side: 'sz', kind: 'community',label: 'Community life',         who: { guide: 'Community, sport and interests' } },
  { id: 'sz-park',     side: 'sz', kind: 'park',     label: 'Waterside park',         photo: 'park', observed: 'Public space photographed on the Shenzhen field trip.' }
];

export const placeById = Object.fromEntries(places.map(place => [place.id, place]));

/* How each account appears in the miniature: lit places, pins, arcs.
   Arc styles: visit (an activity crosses), ties (relationships), move (home
   moved), daily (a daily journey). Labels are short paraphrases. */
export const scenes = {
  overview: { lit: [], pins: [], arcs: [] },
  repair: {
    lit: ['sz-repair'],
    pins: [{ at: 'sz-repair', facet: 'spend', text: 'Parts + repair' }],
    unplaced: ['home', 'work', 'ties'],
    arcs: [{ from: 'ghost:home', to: 'sz-repair', style: 'visit', text: 'Specialist repair' }]
  },
  guide: {
    lit: ['sz-home', 'sz-community', 'hk-family'],
    pins: [{ at: 'sz-home', facet: 'home', text: 'Home moved here' }, { at: 'sz-community', facet: 'ties', text: 'Community + friends' }, { at: 'hk-family', facet: 'ties', text: 'Family' }],
    unplaced: ['work'],
    arcs: [{ from: 'hk-family', to: 'sz-home', style: 'move', text: 'Moved north' }, { from: 'sz-home', to: 'hk-family', style: 'ties', text: 'Family visits' }]
  },
  pupils: {
    lit: ['hk-school'],
    pins: [{ at: 'hk-school', facet: 'work', text: 'School' }, { at: 'mainland', facet: 'home', text: 'Homes across the Mainland', approximate: true }],
    arcs: [{ from: 'mainland', to: 'hk-school', style: 'daily', text: '16,139 daily' }]
  },
  resident: {
    lit: ['hk-rental', 'hk-work', 'sz-tower', 'sz-leisure'],
    pins: [{ at: 'hk-rental', facet: 'home', text: 'Rents here' }, { at: 'hk-work', facet: 'work', text: 'Work' }, { at: 'sz-tower', facet: 'ties', text: 'A sense of home' }, { at: 'sz-leisure', facet: 'spend', text: 'Activities' }],
    arcs: [{ from: 'hk-rental', to: 'sz-tower', style: 'ties', text: 'Family + friends' }, { from: 'hk-rental', to: 'sz-leisure', style: 'visit', text: '' }]
  },
  manager: {
    lit: ['hk-fanling', 'hk-shops', 'sz-dining'],
    pins: [{ at: 'hk-fanling', facet: 'home', text: 'Home' }, { at: 'hk-shops', facet: 'work', text: 'Work' }, { at: 'hk-side', facet: 'spend', text: 'Most shopping: somewhere in Hong Kong', approximate: true }, { at: 'sz-dining', facet: 'spend', text: 'Meals' }],
    unplaced: ['ties'],
    arcs: [{ from: 'hk-fanling', to: 'sz-dining', style: 'visit', text: 'About monthly' }]
  },
  together: { lit: 'all-linked', pins: [], arcs: 'all' }
};

/* The opening tour follows the arrangement order of Script v3. */
export const tour = ['repair', 'guide', 'pupils', 'resident', 'manager'];
