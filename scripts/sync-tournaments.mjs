#!/usr/bin/env node
/**
 * Belgian Chess Tournament Hub — Automated Federation Sync Script
 *
 * Fetches live listings from official Belgian federation sources (Chess-Results BEL,
 * FEFB Circuit JEF), enriches existing tournament records (e.g., real Chess-Results tnr IDs,
 * live player counts), discovers new upcoming Belgian events, bumps `seedVersion`, and
 * writes validated updates to `src/data/tournaments.json`.
 *
 * Usage:
 *   node scripts/sync-tournaments.mjs
 *   node scripts/sync-tournaments.mjs --dry-run
 *   node scripts/sync-tournaments.mjs --report-file sync-report.md --json-file sync-summary.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import { validateStatic } from './verify-tournaments.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT_DIR, 'src', 'data', 'tournaments.json');

const USER_AGENT =
  'Mozilla/5.0 (compatible; BelgianChessHubSync/1.0; +https://github.com/weidu-tpvision/belgian-chess-tournament-hub)';

const BELGIAN_CITY_DIRECTORY = {
  bruxelles: { city: 'Brussels', postalCode: '1000', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8466, lng: 4.3528 },
  brussel: { city: 'Brussels', postalCode: '1000', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8466, lng: 4.3528 },
  brussels: { city: 'Brussels', postalCode: '1000', province: 'Brussels-Capital', region: 'Brussels', lat: 50.8466, lng: 4.3528 },
  wavre: { city: 'Wavre', postalCode: '1300', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.7172, lng: 4.6014 },
  'louvain-la-neuve': { city: 'Louvain-la-Neuve', postalCode: '1348', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.6681, lng: 4.6118 },
  nivelles: { city: 'Nivelles', postalCode: '1400', province: 'Walloon Brabant', region: 'Wallonia', lat: 50.5979, lng: 4.3285 },
  antwerpen: { city: 'Antwerp', postalCode: '2000', province: 'Antwerp', region: 'Flanders', lat: 51.2194, lng: 4.4025 },
  antwerp: { city: 'Antwerp', postalCode: '2000', province: 'Antwerp', region: 'Flanders', lat: 51.2194, lng: 4.4025 },
  turnhout: { city: 'Turnhout', postalCode: '2300', province: 'Antwerp', region: 'Flanders', lat: 51.3225, lng: 4.9447 },
  lier: { city: 'Lier', postalCode: '2500', province: 'Antwerp', region: 'Flanders', lat: 51.1312, lng: 4.5704 },
  mechelen: { city: 'Mechelen', postalCode: '2800', province: 'Antwerp', region: 'Flanders', lat: 51.0259, lng: 4.4776 },
  brasschaat: { city: 'Brasschaat', postalCode: '2930', province: 'Antwerp', region: 'Flanders', lat: 51.2909, lng: 4.4926 },
  leuven: { city: 'Leuven', postalCode: '3000', province: 'Flemish Brabant', region: 'Flanders', lat: 50.8798, lng: 4.7005 },
  hasselt: { city: 'Hasselt', postalCode: '3500', province: 'Limburg', region: 'Flanders', lat: 50.9307, lng: 5.3325 },
  genk: { city: 'Genk', postalCode: '3600', province: 'Limburg', region: 'Flanders', lat: 50.9655, lng: 5.5008 },
  liege: { city: 'Liège', postalCode: '4000', province: 'Liège', region: 'Wallonia', lat: 50.6326, lng: 5.5797 },
  verviers: { city: 'Verviers', postalCode: '4800', province: 'Liège', region: 'Wallonia', lat: 50.5891, lng: 5.8624 },
  eupen: { city: 'Eupen', postalCode: '4700', province: 'Liège', region: 'Wallonia', lat: 50.6279, lng: 6.0365 },
  namur: { city: 'Namur', postalCode: '5000', province: 'Namur', region: 'Wallonia', lat: 50.4674, lng: 4.8720 },
  charleroi: { city: 'Charleroi', postalCode: '6000', province: 'Hainaut', region: 'Wallonia', lat: 50.4108, lng: 4.4446 },
  anderlues: { city: 'Anderlues', postalCode: '6150', province: 'Hainaut', region: 'Wallonia', lat: 50.4063, lng: 4.2709 },
  arlon: { city: 'Arlon', postalCode: '6700', province: 'Luxembourg', region: 'Wallonia', lat: 49.6833, lng: 5.8167 },
  mons: { city: 'Mons', postalCode: '7000', province: 'Hainaut', region: 'Wallonia', lat: 50.4542, lng: 3.9567 },
  tournai: { city: 'Tournai', postalCode: '7500', province: 'Hainaut', region: 'Wallonia', lat: 50.6056, lng: 3.3879 },
  brugge: { city: 'Bruges', postalCode: '8000', province: 'West Flanders', region: 'Flanders', lat: 51.2093, lng: 3.2247 },
  bruges: { city: 'Bruges', postalCode: '8000', province: 'West Flanders', region: 'Flanders', lat: 51.2093, lng: 3.2247 },
  oostende: { city: 'Ostend', postalCode: '8400', province: 'West Flanders', region: 'Flanders', lat: 51.2154, lng: 2.9287 },
  ostend: { city: 'Ostend', postalCode: '8400', province: 'West Flanders', region: 'Flanders', lat: 51.2154, lng: 2.9287 },
  kortrijk: { city: 'Kortrijk', postalCode: '8500', province: 'West Flanders', region: 'Flanders', lat: 50.8279, lng: 3.2649 },
  gent: { city: 'Ghent', postalCode: '9000', province: 'East Flanders', region: 'Flanders', lat: 51.0543, lng: 3.7174 },
  ghent: { city: 'Ghent', postalCode: '9000', province: 'East Flanders', region: 'Flanders', lat: 51.0543, lng: 3.7174 },
  aalter: { city: 'Aalter', postalCode: '9880', province: 'East Flanders', region: 'Flanders', lat: 51.0872, lng: 3.4481 },
  landegem: { city: 'Landegem', postalCode: '9850', province: 'East Flanders', region: 'Flanders', lat: 51.0558, lng: 3.5789 },
  ertvelde: { city: 'Ertvelde', postalCode: '9940', province: 'East Flanders', region: 'Flanders', lat: 51.1786, lng: 3.7439 },
};

function parseArgs(argv) {
  const args = {
    dryRun: false,
    reportFile: null,
    jsonFile: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--dry-run') {
      args.dryRun = true;
    } else if (token === '--report-file' && argv[i + 1]) {
      args.reportFile = argv[++i];
    } else if (token === '--json-file' && argv[i + 1]) {
      args.jsonFile = argv[++i];
    }
  }
  return args;
}

function normalize(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function slugify(str) {
  return normalize(str)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

function getCityAliases(city) {
  const base = normalize(city);
  const aliases = new Set([base]);
  if (base === 'bruges') aliases.add('brugge');
  if (base === 'ghent') aliases.add('gent');
  if (base === 'ostend') aliases.add('oostende');
  if (base === 'antwerp') aliases.add('antwerpen');
  if (base === 'brussels') {
    aliases.add('bruxelles');
    aliases.add('brussel');
  }
  if (base === 'louvain-la-neuve') aliases.add('lln');
  return Array.from(aliases).filter(Boolean);
}

async function fetchHtml(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en,nl;q=0.9,fr;q=0.8',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, status: res.status, html: '' };
    const html = await res.text();
    return { ok: true, status: res.status, html };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, status: 0, html: '', error: String(err?.message || err) };
  }
}

async function fetchChessResultsListings() {
  const res = await fetchHtml('https://chess-results.com/fed.aspx?lan=1&fed=BEL');
  if (!res.ok) return { ok: false, listings: [] };

  const $ = cheerio.load(res.html);
  const listings = [];
  const seenTnr = new Set();

  $('table.CRs1 tr, table.CRs2 tr').each((_, row) => {
    const linkEl = $(row).find('a[href*="tnr"]').first();
    const title = linkEl.text().trim();
    const href = linkEl.attr('href') || '';
    const match = href.match(/tnr(\d+)/i);
    if (!title || !match) return;

    const tnr = match[1];
    if (seenTnr.has(tnr)) return;
    seenTnr.add(tnr);

    const rowText = $(row).text().replace(/\s+/g, ' ').trim();
    listings.push({
      tnr,
      title,
      rowText,
      url: `https://chess-results.com/tnr${tnr}.aspx?lan=1`,
    });
  });

  return { ok: true, listings };
}

async function fetchChessResultsPlayerCount(tnr, tournament) {
  const url = `https://chess-results.com/tnr${tnr}.aspx?lan=1&art=0`;
  const res = await fetchHtml(url);
  if (!res.ok) return null;

  const $ = cheerio.load(res.html);
  const pageTitle = normalize($('h2').first().text().trim());
  if (!pageTitle) return null;

  // Guard: make sure this tnr page actually corresponds to the same tournament/city
  const cityAliases = getCityAliases(tournament.city);
  const titleTokens = normalize(tournament.title)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 5 && !['belgian', 'chess', 'belgisch', 'schaak', 'tournament'].includes(w));
  const matchesTournament =
    cityAliases.some((a) => pageTitle.includes(a)) ||
    titleTokens.some((tok) => pageTitle.includes(tok));
  if (!matchesTournament) return null;

  let count = 0;
  $('table.CRs1').each((_, table) => {
    const headerText = normalize($(table).find('tr').first().text());
    if (!headerText.includes('name') && !headerText.includes('nom') && !headerText.includes('naam')) {
      return;
    }
    $(table)
      .find('tr')
      .each((__, row) => {
        const firstCell = $(row).find('td').first().text().trim();
        if (/^\d+$/.test(firstCell)) {
          const n = Number(firstCell);
          if (n > count) count = n;
        }
      });
  });

  return count > 0 ? count : null;
}

async function fetchFefbJefStages() {
  const res = await fetchHtml('https://fefb.be/jef/etapes');
  if (!res.ok) return { ok: false, stages: [] };

  const $ = cheerio.load(res.html);
  const stages = [];

  $('tr, li, .etape, article').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    const dateMatch = text.match(/(\d{2})[\/.-](\d{2})[\/.-](20\d{2})/);
    if (!dateMatch) return;

    const isoDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    const link = $(el).find('a[href]').first().attr('href') || '';
    const fullUrl = link
      ? link.startsWith('http')
        ? link
        : `https://fefb.be${link.startsWith('/') ? '' : '/'}${link}`
      : 'https://fefb.be/jef/etapes';

    const stageMatch = text.match(/(?:étape|etape)\s*(\d+)/i);
    const stageNum = stageMatch ? stageMatch[1] : null;

    const normText = normalize(text);
    let matchedGeo = null;
    for (const [key, geo] of Object.entries(BELGIAN_CITY_DIRECTORY)) {
      if (normText.includes(key)) {
        matchedGeo = geo;
        break;
      }
    }

    stages.push({
      isoDate,
      stageNum,
      rawText: text.slice(0, 140),
      url: fullUrl,
      geo: matchedGeo,
    });
  });

  // Deduplicate by isoDate
  const byDate = new Map();
  for (const s of stages) {
    if (!byDate.has(s.isoDate)) byDate.set(s.isoDate, s);
  }
  return { ok: true, stages: Array.from(byDate.values()) };
}

function buildSyncReport({
  dryRun,
  oldSeedVersion,
  newSeedVersion,
  changes,
  candidates,
  sourceStats,
}) {
  const lines = [];
  lines.push('# Belgian Chess Tournament Sync Report');
  lines.push('');
  lines.push(`- **Mode:** ${dryRun ? '`dry-run`' : '`write`'}`);
  lines.push(`- **Synced at:** ${new Date().toISOString()}`);
  lines.push(`- **Seed Version:** \`v${oldSeedVersion}\` → \`v${newSeedVersion}\``);
  lines.push(`- **Applied updates:** ${changes.length}`);
  lines.push(`- **Discovery candidates:** ${candidates.length}`);
  lines.push('');

  lines.push('## 📡 Live Federation Feeds Checked');
  for (const stat of sourceStats) {
    lines.push(`- **${stat.name}**: ${stat.summary}`);
  }
  lines.push('');

  if (changes.length > 0) {
    lines.push('## 🔄 Applied Catalog Changes');
    for (const c of changes) {
      lines.push(`- **\`${c.id}\`** (${c.type}): ${c.detail}`);
    }
    lines.push('');
  } else {
    lines.push('## 🔄 Applied Catalog Changes');
    lines.push('No automated changes were required in `src/data/tournaments.json`.');
    lines.push('');
  }

  if (candidates.length > 0) {
    lines.push('## 🔎 Newly Discovered Candidate Events (Manual Review)');
    lines.push(
      'These upcoming listings were spotted on official Belgian feeds and are not yet in `src/data/tournaments.json`:'
    );
    lines.push('');
    for (const cand of candidates.slice(0, 15)) {
      lines.push(`- [${cand.title}](${cand.url}) — _Source: ${cand.source}_`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const raw = fs.readFileSync(CATALOG_PATH, 'utf-8');
  const catalog = JSON.parse(raw);
  const tournaments = catalog.tournaments.map((t) => ({ ...t }));
  const oldSeedVersion = catalog.seedVersion;

  const todayIso = new Date().toISOString().slice(0, 10);
  const changes = [];
  const candidates = [];
  const sourceStats = [];

  // 1. Chess-Results BEL sync
  const crFeed = await fetchChessResultsListings();
  sourceStats.push({
    name: 'Chess-Results.com (fed=BEL)',
    summary: crFeed.ok
      ? `✅ Parsed ${crFeed.listings.length} live BEL listings`
      : '⚠️ Feed unreachable (skipped safely)',
  });

  if (crFeed.ok) {
    const existingNumericTnrs = new Set(
      tournaments.filter((t) => /^\d+$/.test(t.chessResultsTnr || '')).map((t) => t.chessResultsTnr)
    );

    // 1a. Enrich placeholder tnr IDs with unambiguous live matches
    for (const t of tournaments) {
      if (t.endDate < todayIso) continue;
      if (/^\d+$/.test(t.chessResultsTnr || '')) continue;

      const year = t.startDate.slice(0, 4);
      const cityAliases = getCityAliases(t.city);
      const titleTokens = normalize(t.title)
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length >= 4 && !['belgian', 'chess', 'belgisch', 'schaak', 'tournament'].includes(w));

      const matches = crFeed.listings.filter((item) => {
        if (existingNumericTnrs.has(item.tnr)) return false;
        const normTitle = normalize(item.title);
        const hasYear = normTitle.includes(year) || item.rowText.includes(year);
        const hasCity = cityAliases.some((alias) => normTitle.includes(alias));
        const hasKeyword = titleTokens.some((tok) => normTitle.includes(tok));
        return hasYear && hasCity && hasKeyword;
      });

      if (matches.length === 1) {
        const matched = matches[0];
        const prevTnr = t.chessResultsTnr;
        t.chessResultsTnr = matched.tnr;
        t.chessResultsUrl = matched.url;
        t.updatedAt = new Date().toISOString();
        existingNumericTnrs.add(matched.tnr);
        changes.push({
          id: t.id,
          type: 'enriched-tnr',
          detail: `Matched Chess-Results \`tnr${matched.tnr}\` ("${matched.title}") replacing placeholder \`${prevTnr}\`.`,
        });
      }
    }

    // 1b. Refresh live player counts for upcoming tournaments with real numeric tnr IDs
    for (const t of tournaments) {
      if (t.endDate < todayIso) continue;
      if (!/^\d+$/.test(t.chessResultsTnr || '')) continue;

      const liveCount = await fetchChessResultsPlayerCount(t.chessResultsTnr, t);
      if (liveCount !== null && liveCount !== t.registeredPlayersCount) {
        const prevCount = t.registeredPlayersCount;
        t.registeredPlayersCount = liveCount;
        t.updatedAt = new Date().toISOString();
        changes.push({
          id: t.id,
          type: 'updated-players',
          detail: `Updated \`registeredPlayersCount\` from ${prevCount} → ${liveCount} via \`tnr${t.chessResultsTnr}\`.`,
        });
      }
    }

    // 1c. Surface notable new Belgian tournament candidates not yet in catalog
    const notablePattern =
      /\b(jeugd|youth|criterium|jef|bjk|cbj|bycc|open|kampioenschap|championnat|rapid|rapide|blitz|snelschaak|kerst|triathlon|meesters)\b/i;
    for (const item of crFeed.listings) {
      if (existingNumericTnrs.has(item.tnr)) continue;
      if (!notablePattern.test(item.title)) continue;
      const normTitle = normalize(item.title);
      const alreadyByTitle = tournaments.some((t) => {
        const aliases = getCityAliases(t.city);
        const year = t.startDate.slice(0, 4);
        return normTitle.includes(year) && aliases.some((a) => normTitle.includes(a));
      });
      if (!alreadyByTitle) {
        candidates.push({
          title: item.title,
          url: item.url,
          source: 'Chess-Results BEL',
        });
      }
    }
  }

  // 2. FEFB Circuit JEF sync
  const jefFeed = await fetchFefbJefStages();
  sourceStats.push({
    name: 'FEFB Circuit JEF (fefb.be/jef/etapes)',
    summary: jefFeed.ok
      ? `✅ Parsed ${jefFeed.stages.length} stage date entries`
      : '⚠️ Feed unreachable (skipped safely)',
  });

  if (jefFeed.ok) {
    for (const stage of jefFeed.stages) {
      if (stage.isoDate < todayIso) continue;
      const alreadyExists = tournaments.some(
        (t) => t.circuit === 'JEF' && t.startDate === stage.isoDate
      );
      if (alreadyExists) continue;

      if (stage.geo) {
        const year = stage.isoDate.slice(0, 4);
        const stageLabel = stage.stageNum ? `Étape ${stage.stageNum}` : 'Stage';
        const id = `jef-${slugify(stage.geo.city)}-${stage.isoDate.slice(0, 7)}`;
        if (tournaments.some((t) => t.id === id)) continue;

        const newTournament = {
          id,
          slug: slugify(`circuit-jef-${year}-${stageLabel}-${stage.geo.city}`),
          title: `Circuit JEF ${year} — ${stageLabel} : ${stage.geo.city}`,
          englishSummary: `Official stage of the ${year} Francophone JEF Youth Circuit in ${stage.geo.city} on ${stage.isoDate}. 9-round Swiss youth rapid tournament across U8, U10, U12, U14, U16, and U20 categories.`,
          startDate: stage.isoDate,
          endDate: stage.isoDate,
          rounds: 9,
          timeControl: 'rapid',
          timeControlDetails: '12 min + 3 sec/move',
          category: 'youth',
          circuit: 'JEF',
          ageGroups: ['U8', 'U10', 'U12', 'U14', 'U16', 'U20'],
          city: stage.geo.city,
          postalCode: stage.geo.postalCode,
          province: stage.geo.province,
          region: stage.geo.region,
          venueAddress: `${stage.geo.city}, ${stage.geo.postalCode} ${stage.geo.city}`,
          lat: stage.geo.lat,
          lng: stage.geo.lng,
          organizerClub: 'FEFB — Circuit JEF',
          clubMatricule: '201',
          entryFee: '€6 (see FEFB JEF page)',
          scheduleSummary: 'Check-in 10:00–10:45 • Round 1 at 11:00 • 9 rounds Rapid',
          officialUrl: stage.url,
          flyerUrl: 'https://fefb.be/jef/etapes',
          chessResultsUrl: 'https://fefb.be/jef/etapes',
          chessResultsTnr: `JEF${year}-${stage.stageNum || stage.isoDate.slice(5, 7)}`,
          registeredPlayersCount: 100,
          isFideRated: false,
          isNationalRated: true,
          sources: ['FEFB JEF Circuit'],
          updatedAt: new Date().toISOString(),
        };

        tournaments.push(newTournament);
        changes.push({
          id: newTournament.id,
          type: 'added-event',
          detail: `Added upcoming JEF stage "${newTournament.title}" on ${newTournament.startDate} (${stage.url}).`,
        });
      } else {
        candidates.push({
          title: `JEF Stage (${stage.isoDate}): ${stage.rawText}`,
          url: stage.url,
          source: 'FEFB JEF Circuit',
        });
      }
    }
  }

  const hasChanges = changes.length > 0;
  const newSeedVersion = hasChanges ? oldSeedVersion + 1 : oldSeedVersion;

  if (hasChanges) {
    tournaments.sort(
      (a, b) => a.startDate.localeCompare(b.startDate) || a.id.localeCompare(b.id)
    );

    const nextCatalog = {
      seedVersion: newSeedVersion,
      lastVerifiedAt: new Date().toISOString(),
      tournaments,
    };

    const { errors } = validateStatic(nextCatalog);
    if (errors.length > 0) {
      console.error('Refusing to write invalid synced catalog:', errors);
      process.exitCode = 1;
      return;
    }

    if (!args.dryRun) {
      fs.writeFileSync(CATALOG_PATH, JSON.stringify(nextCatalog, null, 2) + '\n', 'utf-8');
    }
  }

  const report = buildSyncReport({
    dryRun: args.dryRun,
    oldSeedVersion,
    newSeedVersion,
    changes,
    candidates,
    sourceStats,
  });

  console.log(report);

  if (args.reportFile) {
    fs.writeFileSync(path.resolve(ROOT_DIR, args.reportFile), report, 'utf-8');
  }

  const summary = {
    hasChanges,
    dryRun: args.dryRun,
    oldSeedVersion,
    newSeedVersion,
    addedCount: changes.filter((c) => c.type === 'added-event').length,
    updatedCount: changes.filter((c) => c.type !== 'added-event').length,
    candidateCount: candidates.length,
  };

  if (args.jsonFile) {
    fs.writeFileSync(path.resolve(ROOT_DIR, args.jsonFile), JSON.stringify(summary, null, 2), 'utf-8');
  }
}

main().catch((err) => {
  console.error('Sync script crashed:', err);
  process.exitCode = 1;
});
