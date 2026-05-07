/**
 * Fighters Edge — sitemap generator
 *
 * Fetches every public entity from the live API and writes public/sitemap.xml.
 *
 * Run:
 *   npm run sitemap
 *
 * Optionally override the API base:
 *   API_URL=https://fighters-edge.com/api npm run sitemap
 */

const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');

// ── Config ────────────────────────────────────────────────────────────────────

const SITE  = 'https://www.fighters-edge.com';
// API lives on the non-www origin (www redirects 301)
const API   = (process.env.API_URL || 'https://fighters-edge.com/api').replace(/\/$/, '');
const OUT   = path.join(__dirname, '../public/sitemap.xml');
const TODAY = new Date().toISOString().slice(0, 10);

// ── Static routes ─────────────────────────────────────────────────────────────

const STATIC = [
  { loc: '/',             priority: '1.0', changefreq: 'daily'   },
  { loc: '/matches',      priority: '0.9', changefreq: 'daily'   },
  { loc: '/combos',       priority: '0.8', changefreq: 'daily'   },
  { loc: '/players',      priority: '0.8', changefreq: 'daily'   },
  { loc: '/games',        priority: '0.8', changefreq: 'weekly'  },
  { loc: '/tier-lists',   priority: '0.7', changefreq: 'weekly'  },
  { loc: '/how-it-works', priority: '0.6', changefreq: 'monthly' },
  { loc: '/use-cases',    priority: '0.6', changefreq: 'monthly' },
];

// ── HTTP helper (follows one redirect, returns parsed JSON) ───────────────────

function get(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, { headers: { Accept: 'application/json' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      let raw = '';
      res.on('data', chunk => (raw += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (_) { resolve(null); }
      });
    }).on('error', reject);
  }).catch(err => {
    console.warn(`  ⚠  ${url}: ${err.message}`);
    return null;
  });
}

// ── XML builder ───────────────────────────────────────────────────────────────

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({ loc, priority, changefreq, lastmod }) {
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(SITE + loc)}</loc>`,
  ];
  if (lastmod)    lines.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority)   lines.push(`    <priority>${priority}</priority>`);
  lines.push('  </url>');
  return lines.join('\n');
}

function toDate(raw) {
  if (!raw) return TODAY;
  try { return new Date(raw).toISOString().slice(0, 10); }
  catch (_) { return TODAY; }
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchGames() {
  process.stdout.write('  Fetching games… ');
  const data  = await get(`${API}/gameQuery?queryName=IsFeatured&queryValue=true`);
  const games = (data && data.games) ? data.games : [];
  console.log(games.length);
  return games.map(g => ({
    loc: `/game/${g._id}`,
    lastmod: toDate(g.updatedAt || g.ReleaseDate),
    priority: '0.8',
    changefreq: 'weekly',
  }));
}

async function fetchCharacters() {
  process.stdout.write('  Fetching characters… ');
  const data  = await get(`${API}/characters`);
  const chars = (data && data.characters) ? data.characters : [];
  console.log(chars.length);
  // Characters have no Slug field — use /character/:id
  return chars.map(c => ({
    loc: `/character/${c._id}`,
    lastmod: toDate(c.updatedAt || c.createdAt),
    priority: '0.7',
    changefreq: 'weekly',
  }));
}

async function fetchPlayers() {
  process.stdout.write('  Fetching players… ');
  const data    = await get(`${API}/players`);
  const players = (data && data.players) ? data.players : [];
  // Only include players who have actually appeared in indexed matches
  const active  = players.filter(p => (p.MatchupAppearance || 0) > 0);
  console.log(`${active.length} active (of ${players.length} total)`);
  return active.map(p => ({
    // Prefer slug-based URL for SEO; fall back to ID
    loc: p.Slug ? `/p/${encodeURIComponent(p.Slug.toLowerCase())}` : `/player/${p._id}`,
    lastmod: toDate(p.updatedAt || p.createdAt),
    priority: '0.7',
    changefreq: 'weekly',
  }));
}

async function fetchTournaments() {
  process.stdout.write('  Fetching tournaments… ');
  const data        = await get(`${API}/tournaments`);
  const tournaments = (data && data.tournaments) ? data.tournaments : [];
  console.log(tournaments.length);
  return tournaments.map(t => ({
    loc: `/tournament/${t._id}`,
    lastmod: toDate(t.updatedAt || t.EventDate),
    priority: '0.6',
    changefreq: 'monthly',
  }));
}

async function fetchTierLists() {
  process.stdout.write('  Fetching tier lists… ');
  const data  = await get(`${API}/tier-lists`);
  const lists = (data && data.tierLists)
    ? data.tierLists
    : (Array.isArray(data) ? data : []);
  console.log(lists.length);
  return lists.map(t => ({
    loc: `/tier-lists/${t._id}`,
    lastmod: toDate(t.updatedAt || t.createdAt),
    priority: '0.5',
    changefreq: 'monthly',
  }));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function generate() {
  console.log(`\nGenerating sitemap (API: ${API})\n`);

  const [games, characters, players, tournaments, tierLists] = await Promise.all([
    fetchGames(),
    fetchCharacters(),
    fetchPlayers(),
    fetchTournaments(),
    fetchTierLists(),
  ]);

  const sections = [
    { label: 'Static pages', entries: STATIC.map(s => urlEntry({ ...s, lastmod: TODAY })) },
    { label: 'Games',        entries: games.map(urlEntry) },
    { label: 'Characters',   entries: characters.map(urlEntry) },
    { label: 'Players',      entries: players.map(urlEntry) },
    { label: 'Tournaments',  entries: tournaments.map(urlEntry) },
    { label: 'Tier lists',   entries: tierLists.map(urlEntry) },
  ];

  const body = sections
    .filter(s => s.entries.length > 0)
    .map(s => [`  <!-- ── ${s.label} ── -->`, ...s.entries].join('\n'))
    .join('\n\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '',
    body,
    '',
    '</urlset>',
  ].join('\n');

  fs.writeFileSync(OUT, xml, 'utf8');

  const total =
    STATIC.length + games.length + characters.length +
    players.length + tournaments.length + tierLists.length;

  console.log(`\n✅  Sitemap written → ${OUT}`);
  console.log(`   ${total.toLocaleString()} URLs total`);
  console.log(`     ${STATIC.length}      static pages`);
  console.log(`     ${games.length}      games`);
  console.log(`     ${characters.length}    characters`);
  console.log(`     ${players.length.toLocaleString()}   players`);
  console.log(`     ${tournaments.length}    tournaments`);
  console.log(`     ${tierLists.length}       tier lists`);
  console.log('\n── Next steps ────────────────────────────────────────────────');
  console.log('  1. Deploy to production  →  sitemap is at /sitemap.xml');
  console.log('  2. Google Search Console →  Sitemaps → Add new sitemap:');
  console.log('     https://www.fighters-edge.com/sitemap.xml');
  console.log('  3. Bing Webmaster Tools  →  Sitemaps → Submit sitemap URL:');
  console.log('     https://www.fighters-edge.com/sitemap.xml');
  console.log('  4. Re-run  npm run sitemap  whenever content is added.\n');
}

generate().catch(err => {
  console.error('\n✗ Fatal:', err.message);
  process.exit(1);
});
