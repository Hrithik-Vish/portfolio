/*
  Project content for the portfolio.

  To add a project later: copy one entry below, change the fields, and save.
  The card on the main page and the full detail view are both built from this.

  Fields
    id         short, lowercase, no spaces. Used in the shareable link: yoursite/#id
    title      project name
    badge      small tag next to the title (e.g. "in progress"), or null
    oneLiner   one plain-English sentence shown on the card
    stats      up to 4 { value, label } pairs shown as the number row
    tags       tech tags
    simple     plain-language description (for non-technical readers)
    technical  list of paragraphs; light HTML allowed (<strong>, <code>)
    steps      "how it works" list; planned: true marks a part still being built
    links      buttons in the detail view; `contact` must be a key in main.js `contacts`
*/
window.PROJECTS = [
  {
    id: 'geocoderz',
    title: 'GeoCoderZ',
    badge: null,
    oneLiner: 'Finds the real place behind vague location names in Indian incident reports.',
    stats: [
      { value: '2813\u21921391ms', label: 'repeat-lookup latency' },
      { value: '780K+', label: 'gazetteer rows' },
      { value: '121K+', label: 'alternate names' },
      { value: '21', label: 'automated tests' }
    ],
    tags: ['FastAPI', 'spaCy', 'PostGIS', 'Supabase', 'React-Leaflet'],
    simple:
      'Incident reports often mention a place by name, but many towns share the same name. ' +
      'GeoCoderZ works out which one is meant and puts it on the map. Instead of just guessing ' +
      'the biggest town, it looks at clues like the region mentioned and which places are nearby. ' +
      'Places it has looked up before come back about twice as fast. When it isn\u2019t sure, it says ' +
      'so and gives a reason, instead of showing a wrong location with confidence.',
    technical: [
      'Automatically identifies the correct location from ambiguous incident reports \u2014 like two towns ' +
        'sharing a name \u2014 through a four-stage pipeline backed by a 780K+ row gazetteer. A two-level cache ' +
        'cuts repeat-lookup time roughly in half, and a scoring engine weighs regional context over guessing ' +
        'by population alone.',
      'Schema: <strong>6-table PostgreSQL/PostGIS</strong> design with a <code>121K+</code> row alternate-name ' +
        'table feeding candidate lookup. Disambiguation scoring combines <strong>region hints</strong>, ' +
        '<strong>spatial proximity</strong>, and population priors, with confidence capped on unsupported ' +
        'matches \u2014 verified by a <strong>21-case automated test suite</strong> (unit + live integration). ' +
        'Out-of-scope queries degrade gracefully via a local-to-Nominatim fallback, returning a stated reason ' +
        'instead of a silently wrong coordinate.'
    ],
    steps: [
      { name: 'Extraction', desc: 'Pull candidate place names from free-text incident reports' },
      { name: 'Normalization', desc: 'Standardize spelling variants and informal naming' },
      { name: 'Candidate lookup', desc: 'Match against a 780K+ row local gazetteer, cached' },
      { name: 'Disambiguation', desc: 'Resolve same-named places via region hints and spatial proximity' }
    ],
    links: [
      { label: 'Live demo \u2197', contact: 'geocoderz-demo' },
      { label: 'GitHub \u2197', contact: 'geocoderz-github' }
    ]
  },
  {
    id: 'scrollping',
    title: 'ScrollPing',
    badge: 'in progress',
    oneLiner: 'A bot that watches manga and novel sites and alerts readers on Telegram when a new chapter is out.',
    stats: [
      { value: '51h', label: 'empirical IP-block test' },
      { value: '18', label: 'scheduled runs' },
      { value: '6/6', label: 'target sites, 100% success' },
      { value: 'Free', label: 'tier-only by design' }
    ],
    tags: ['Python', 'PostgreSQL', 'Supabase', 'Telegram Bot API', 'GitHub Actions'],
    simple:
      'Fans of manga, manhwa and web novels keep refreshing sites to check for new chapters. ' +
      'ScrollPing checks many of those sites automatically on a schedule, and it\u2019s being built to send ' +
      'a Telegram message when a followed series updates. It runs entirely on free services, and one broken ' +
      'website can\u2019t stop it from checking the others. Before building it this way, a 51-hour test confirmed ' +
      'that free hosting wouldn\u2019t get blocked by those sites. It worked on all 6, every time.',
    technical: [
      'A scraper and Telegram bot being built to track manga/manhwa/novel releases across multiple sites and ' +
        'notify subscribers, designed to run entirely on free-tier infrastructure. A 51-hour empirical test ' +
        '(18 scheduled runs) confirmed free GitHub Actions infra wouldn\u2019t get IP-blocked \u2014 100% success ' +
        'across all 6 target sites, no paid proxy needed.',
      'Schema models <strong>fractional chapter numbers</strong> (e.g. <code>66.5</code>) and per-user ' +
        'subscriptions, batched to stay within <strong>free-tier rate limits</strong>. Validated infra choice ' +
        'empirically: a <strong>51-hour test</strong> across <code>18 scheduled runs</code> confirmed zero ' +
        'IP-blocking on free GitHub Actions across all 6 target sites \u2014 ruling out the need for a paid ' +
        'anti-bot proxy. Network/DB failures retry with <strong>backoff</strong>; per-site isolation means one ' +
        'broken source never halts the run.'
    ],
    steps: [
      { name: 'Fetch', desc: 'Poll manga/manhwa/novel aggregator sites on a schedule' },
      { name: 'Parse', desc: 'Extract new chapter data, including fractional numbers' },
      { name: 'Isolate & retry', desc: 'Retry network/DB failures with backoff, per-site isolation' },
      { name: 'Notify', desc: 'Push updates to subscribers via Telegram', planned: true }
    ],
    links: [
      { label: 'GitHub \u2197', contact: 'scrollping-github' }
    ]
  }
];
