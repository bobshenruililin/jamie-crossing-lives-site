/* Public-safe paraphrases of accounts in Jamie Ko's presentation script,
   checked 31 October 2026. These are selected accounts, not population types.
   No private participant identifiers, source-document links or invented values. */
export const lifeAccounts = [
  {
    id: 'repair', label: 'Repair customer', short: 'Crossing for specialist capability', tone: 'use',
    title: 'A trip for specialist parts and expertise.',
    note: 'He described taking older equipment to Shenzhen because suitable parts and expertise were difficult to find in Hong Kong.',
    source: 'Paraphrase of the repair customer’s account in the presentation script, sections 3 and 4A. It reports his reason for crossing; it does not establish his home, workplace, travel frequency or a measured saving.',
    homeSide: null, workSide: null, routes: ['use'],
    facts: {
      home: { text: 'Not established in this account', status: 'not established here' },
      work: { text: 'Not established in this account', status: 'not established here' },
      use: { text: 'Specialist parts and repair expertise in Shenzhen', status: 'shown' },
      ties: { text: 'Not established in this account', status: 'not established here' }
    },
    ribbons: [
      [{ facet: 'use', text: 'Suitable parts hard to find', detail: 'Hong Kong, in his account' }],
      [{ facet: 'use', text: 'Specialist parts + repair', detail: 'Someone could source them' }]
    ],
    contrast: [
      { label: 'What crossed', text: 'The search for a particular repair.' },
      { label: 'What is unknown', text: 'Where he lives and works.' }
    ],
    routeLabels: { use: 'SPECIALIST REPAIR' },
    routeMeaning: { use: 'The repair customer compared difficulty finding parts in Hong Kong with specialist capability in Shenzhen.' }
  },
  {
    id: 'guide', label: 'Guide who moved north', short: 'A different home; continuing family ties', tone: 'home',
    title: 'Home moved. Family connections continued.',
    note: 'She described lower earnings alongside lower living costs and preferred work, with community life in Shenzhen and family visits in Hong Kong.',
    source: 'Paraphrase of the guide who moved north, presentation script sections 3, 4A and 4C. Lower earnings and living costs are her account, not a measured general benefit. Guiding work is reported; its precise location is not established.',
    homeSide: 1, workSide: null, routes: ['ties'],
    facts: {
      home: { text: 'Moved from Hong Kong to Shenzhen', status: 'shown' },
      work: { text: 'Preferred guiding work; location not established', status: 'location unstated' },
      use: { text: 'A particular purchasing pattern is not established', status: 'not established here' },
      ties: { text: 'Community and guiding friendships in Shenzhen; family visits in Hong Kong', status: 'shown' }
    },
    ribbons: [
      [{ facet: 'ties', text: 'Family visits continued', detail: 'Hong Kong' }],
      [{ facet: 'home', text: 'Home moved here', detail: 'Lower living costs, in her account' }, { facet: 'ties', text: 'Community + guiding friends', detail: 'Centred in Shenzhen' }]
    ],
    contrast: [
      { label: 'What changed', text: 'Home, living costs and preferred work.' },
      { label: 'What remained', text: 'Family connections in Hong Kong.' }
    ],
    routeLabels: { ties: 'FAMILY VISITS' },
    routeMeaning: { ties: 'Family visits to Hong Kong continued after her home moved to Shenzhen.' }
  },
  {
    id: 'professional', label: 'Professional with Shenzhen ties', short: 'Work and rent here; a sense of home there', tone: 'ties',
    title: 'An address and a sense of home can differ.',
    note: 'She works and rents in Hong Kong, while property, family, friends and many activities connect her to Shenzhen, which she described as home.',
    source: 'Paraphrase of the professional with Shenzhen ties, presentation script sections 3 and 4C. Employment and rental housing are in Hong Kong. The account does not establish a regular cross-border commute or quantify time spent in each city.',
    homeSide: 0, workSide: 0, routes: ['ties', 'localwork'],
    facts: {
      home: { text: 'Rents in Hong Kong; has property and describes Shenzhen as home', status: 'shown' },
      work: { text: 'University work in Hong Kong', status: 'shown' },
      use: { text: 'Shopping and many activities in Shenzhen', status: 'shown' },
      ties: { text: 'Close family and friends in Shenzhen', status: 'shown' }
    },
    ribbons: [
      [{ facet: 'home', text: 'Rents in Hong Kong', detail: 'Current rental base' }, { facet: 'work', text: 'University work', detail: 'Hong Kong' }],
      [{ facet: 'ties', text: 'Property · family · friends', detail: 'She described Shenzhen as home' }, { facet: 'use', text: 'Shopping + activities', detail: 'Many everyday connections' }]
    ],
    contrast: [
      { label: 'Based in Hong Kong', text: 'Employment and rented housing.' },
      { label: 'Connected to Shenzhen', text: 'Relationships, activities and belonging.' }
    ],
    routeLabels: { ties: 'TIES + ACTIVITIES', localwork: 'WORK' },
    routeMeaning: { ties: 'Family, friendships, shopping and activities connect her Hong Kong base with Shenzhen.', localwork: 'Her employment and rental housing are both in Hong Kong.' }
  },
  {
    id: 'manager', label: 'Sheung Shui store manager', short: 'Meals across; most routines stay local', tone: 'use',
    title: 'Meals cross. Most shopping stays local.',
    note: 'She lives in Fanling, works in Sheung Shui and said she visits Shenzhen about once a month, mainly for meals. Most shopping remains in Hong Kong.',
    source: 'Paraphrase of the Sheung Shui store manager, presentation script sections 3 and 4A. Visit frequency and shopping patterns are reported descriptions, not transaction data. This is distinct from the Sheung Shui resident and the other shop employee.',
    homeSide: 0, workSide: 0, routes: ['use', 'localwork'],
    facts: {
      home: { text: 'Fanling, Hong Kong', status: 'shown' },
      work: { text: 'Sheung Shui, Hong Kong', status: 'shown' },
      use: { text: 'Shenzhen visits about monthly, mainly for meals; most shopping in Hong Kong', status: 'shown' },
      ties: { text: 'Not established in this account', status: 'not established here' }
    },
    ribbons: [
      [{ facet: 'home', facets: ['home', 'work'], text: 'Fanling home · Sheung Shui work', detail: 'Both in Hong Kong' }, { facet: 'use', text: 'Most shopping stays here', detail: 'Her reported pattern' }],
      [{ facet: 'use', text: 'Visits about once a month', detail: 'Mainly for meals, she said' }]
    ],
    contrast: [
      { label: 'What crosses', text: 'An occasional meal out.' },
      { label: 'What stays local', text: 'Home, work and most shopping.' }
    ],
    routeLabels: { use: 'OCCASIONAL MEALS', localwork: 'WORK' },
    routeMeaning: { use: 'She reported Shenzhen visits about once a month, mainly for meals.', localwork: 'Her home in Fanling and work in Sheung Shui are both in Hong Kong.' }
  }
];
