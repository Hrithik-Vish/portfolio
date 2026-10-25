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
    diagrams   one or more flow diagrams shown under "how it works" (tabs appear if there are 2+)
    links      buttons in the detail view; `contact` must be a key in main.js `contacts`

  A diagram
    id, label     tab name; `tag` adds a small badge to the tab (e.g. "planned")
    caption       one line shown above the diagram
    image         optional full flowchart image, opened by "View full flowchart"
    note          optional small footnote under the diagram
    nodes         the boxes, top to bottom:
        { title, sub }                 a normal step
        tag                            small label on the box (e.g. "cache level 1")
        io: true                       highlight as a start/end point
        planned: true                  dashed box = not built yet
        arrow: 'label'                 text on the arrow leaving this box
        exit: { label, text, tone }    a side branch; tone = good | warn | planned | neutral
        { divider: 'text' }            a labelled break (e.g. "for each site")
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
    diagrams: [
      {
        id: 'request-flow',
        label: 'Request flow',
        caption: 'What happens to every text sent to POST /resolve, one place name at a time.',
        image: 'images/geocoderz-flow.webp',
        imageAlt: 'Full GeoCoderZ backend flowchart',
        nodes: [
          { io: true, title: 'POST /resolve',
            sub: 'Receives the text and logs a resolution_requests row (position tracking starts here). spaCy then pulls out the place-name spans.' },
          { divider: 'for each extracted name' },
          { title: 'Fast-path check', tag: 'cache level 1',
            sub: 'Looks the raw name up in the raw_name_fast_path view.',
            arrow: 'miss',
            exit: { label: 'hit', tone: 'good', text: 'Use the stored result directly. Skips cleanup, lookup and disambiguation.' } },
          { title: 'rapidfuzz cleanup',
            sub: 'Normalizes spelling and matches known aliases.' },
          { title: 'Resolved-places check', tag: 'cache level 2',
            sub: 'Does the cleaned name already exist in resolved_places?',
            arrow: 'miss',
            exit: { label: 'hit', tone: 'good', text: 'Reuse the existing resolution. Skips lookup and disambiguation, and writes a new raw_name_aliases row.' } },
          { title: 'Local GeoNames lookup',
            sub: 'Searches the local 780K+ row gazetteer first.',
            arrow: 'not found',
            exit: { label: 'found', tone: 'neutral', text: 'Skips the fallback and goes straight to disambiguation.' } },
          { title: 'Nominatim fallback', tag: 'India-scoped',
            sub: 'Only used when the local lookup finds nothing.',
            arrow: 'found',
            exit: { label: 'not found', tone: 'warn', text: 'Marks this one name as failed. It is not cached, so it gets a fresh retry next time.' } },
          { title: 'Disambiguate & store',
            sub: 'Scores the candidates by population, proximity and region hints, and returns a confidence and a reason. Then writes a new resolved_places row, followed by a new raw_name_aliases row.' },
          { divider: 'all names done' },
          { io: true, title: 'Response assembly',
            sub: 'Combines every name\u2019s result using its original position in the text, and returns JSON per the API contract.' }
        ]
      }
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
      'ScrollPing checks many of those sites automatically, and it\u2019s being built to run on a schedule ' +
      'and send a Telegram message when a followed series updates. It\u2019s designed to run entirely on free ' +
      'services, and one broken website can\u2019t stop it from checking the others. Before building it this way, ' +
      'a 51-hour test confirmed that free hosting wouldn\u2019t get blocked by those sites. It worked on all 6, ' +
      'every time.',
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
    diagrams: [
      {
        id: 'backend',
        label: 'Backend pipeline',
        caption: 'One scraper run, from schedule to notifications. Solid boxes are built; dashed boxes are still to be made.',
        image: 'images/scrollping-backend-flow.webp',
        imageAlt: 'Full ScrollPing backend flowchart',
        note: 'Later (V2): a per-site pass/fail table to spot sites that keep failing, and multi-language MangaDex support.',
        nodes: [
          { planned: true, title: 'Scheduled trigger',
            sub: 'A GitHub Actions cron job, with pytest and CI/CD gating every deploy. Free-tier IP viability is already tested: 6 sites, 100% pass.' },
          { title: 'main.py starts',
            sub: 'Loads each site\u2019s parse rules once, reads the site list from the websites table, and opens a scraper_logs row marked \u201cfail\u201d until the run finishes.',
            exit: { label: 'if the log insert fails', tone: 'planned', text: 'Abort and alert. To be made; not handled yet.' } },
          { divider: 'for each site' },
          { title: 'Fetch the page',
            sub: 'fetch_html wrapped in retry(), with a User-Agent always set.',
            exit: { label: 'retries exhausted', tone: 'warn', text: 'Returns an empty list for this site. Non-fatal: it is tried again next run.' } },
          { title: 'Parse chapter links',
            sub: 'HTML sites (asura, hivetoons, kunmanga, vortex): a keyword and number regex returns candidate chapter links.',
            exit: { label: 'to be made', tone: 'planned', text: 'MangaDex JSON dispatch, and BeautifulSoup selectors for mgeko.' } },
          { title: 'Compare with the database',
            sub: 'Fetches this site\u2019s tracked novels. A pure function (no I/O) then matches links to novels, extracts chapter numbers, keeps the highest per novel, and diffs against a snapshot of each novel\u2019s latest chapter.',
            exit: { label: 'nothing parsed, or fetch fails', tone: 'warn', text: 'Returns an empty list for this site.' } },
          { divider: 'all sites done' },
          { title: 'Update the novels table',
            sub: 'One batched update with every novel that has a newer chapter.',
            exit: { label: 'if the update fails', tone: 'warn', text: 'The run ends and its scraper_logs row stays \u201cfail\u201d.' } },
          { title: 'Find subscribers',
            sub: 'Builds a lookup by novel_id, then one bulk Supabase query for users with reading_status = \u201creading\u201d, including their telegram_user_id.' },
          { planned: true, title: 'Batch and send Telegram messages',
            sub: 'Group the updates per user and send one message each.',
            exit: { label: 'if a send fails', tone: 'planned', text: 'Retry and failure handling is still to be made. Today a missed ping would be a silent miss.' } },
          { io: true, title: 'Mark the run successful',
            sub: 'scraper_logs flips to \u201csuccess\u201d as the very last step of the run.' }
        ]
      },
      {
        id: 'user-flow',
        label: 'User flow',
        tag: 'planned',
        caption: 'How a reader would use ScrollPing. Most of this is still to be made; the scraper behind it is the part that exists today.',
        image: 'images/scrollping-user-flow.webp',
        imageAlt: 'Full ScrollPing user flowchart',
        note: 'Later (V2): scaling beyond solo use to hundreds of users, more than 6 supported sites, and multi-language chapters.',
        nodes: [
          { planned: true, io: true, title: 'Landing page',
            sub: 'What ScrollPing does, which sites it supports, and a Start button.' },
          { planned: true, title: 'Sign up and link Telegram',
            sub: 'The user opens the bot, and the bot captures their telegram_user_id into the users table. Returning users just log in.' },
          { planned: true, title: 'Dashboard: my tracked novels',
            sub: 'Search or browse novels across the 6 supported sites, request one that is missing, choose a reading status, pause, or unsubscribe.' },
          { title: 'user_subscriptions table', tag: 'database',
            sub: 'Stores user_id, novel_id and reading_status. Every scraper run reads it, and only \u201creading\u201d novels get pings.' },
          { title: 'Scraper run',
            sub: 'The backend pipeline checks each site for new chapters.',
            arrow: 'new chapter found' },
          { planned: true, title: 'Telegram ping',
            sub: 'One batched message per user with the novel, chapter number and link. If nothing is new, nothing is sent.' },
          { planned: true, io: true, title: 'The reader reacts',
            sub: 'Tap the link to read on the source site, ignore it (the next run only pings newer chapters), or use bot buttons to mute, mark as read, or change status.' }
        ]
      }
    ],
    links: [
      { label: 'GitHub \u2197', contact: 'scrollping-github' }
    ]
  }
];
