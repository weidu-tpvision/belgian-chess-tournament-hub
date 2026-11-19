#!/usr/bin/env node
/**
 * Belgian Chess Tournament Hub — Data & Accuracy Verification Script
 *
 * Usage:
 *   node scripts/verify-tournaments.mjs                  # Static validation only (fast, offline-safe, for PR CI)
 *   node scripts/verify-tournaments.mjs --live           # Static + live URL & official source checks
 *   node scripts/verify-tournaments.mjs --live --report-file accuracy-report.md --json-file accuracy-summary.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT_DIR, 'src', 'data', 'tournaments.json');

const VALID_TIME_CONTROLS = new Set(['standard', 'rapid', 'blitz']);
const VALID_CATEGORIES = new Set(['youth', 'open', 'both']);
const VALID_CIRCUITS = new Set(['JEF', 'VSF_YOUTH', 'NATIONAL', 'OPEN', 'NONE']);
const VALID_REGIONS = new Set(['Flanders', 'Wallonia', 'Brussels']);

const FEDERATION_HUBS = [
  { name: 'BYCCO (Belgian Youth Championship)', url: 'https://www.bycco.be/en' },
  { name: 'FRBE-KBSB Blog', url: 'https://blog.frbe-kbsb-ksb.be/' },
  {
    name: 'Vlaams Jeugdschaakcriterium Calendar',
    url: 'https://sites.google.com/view/vlaams-jeugdschaakcriterium/kalender',
  },
  { name: 'KMSK Mechelen Calendar', url: 'https://www.kmsk.eu/kalender' },
  { name: 'FEFB Circuit JEF Stages', url: 'https://fefb.be/jef/etapes' },
  { name: 'Chess-Results Belgium (fed=BEL)', url: 'https://chess-results.com/fed.aspx?lan=1&fed=BEL' },
];

function parseArgs(argv) {
  const args = {
    live: false,
    reportFile: null,
    jsonFile: null,
    failOnLiveErrors: true,
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--live') {
      args.live = true;
    } else if (token === '--no-fail-on-live') {
      args.failOnLiveErrors = false;
    } else if (token === '--report-file' && argv[i + 1]) {
      args.reportFile = argv[++i];
    } else if (token === '--json-file' && argv[i + 1]) {
      args.jsonFile = argv[++i];
    }
  }
  return args;
}

function loadCatalog() {
  const raw = fs.readFileSync(CATALOG_PATH, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('src/data/tournaments.json must contain a JSON object.');
  }
  if (!Array.isArray(parsed.tournaments)) {
    throw new Error('src/data/tournaments.json must contain a `tournaments` array.');
  }
  return parsed;
}

function isValidIsoDate(dateStr) {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

function isValidHttpUrl(urlStr) {
  if (typeof urlStr !== 'string' || !urlStr.trim()) return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateStatic(catalog) {
  const errors = [];
  const warnings = [];
  const seenIds = new Set();
  const seenSlugs = new Set();

  if (!Number.isInteger(catalog.seedVersion) || catalog.seedVersion < 1) {
    errors.push({
      scope: 'tournaments.json',
      message: `Invalid \`seedVersion\`: ${catalog.seedVersion} (expected positive integer).`,
    });
  }

  if (typeof catalog.lastVerifiedAt !== 'string' || Number.isNaN(Date.parse(catalog.lastVerifiedAt))) {
    errors.push({
      scope: 'tournaments.json',
      message: `Invalid \`lastVerifiedAt\`: "${catalog.lastVerifiedAt}" (expected ISO timestamp).`,
    });
  }

  const tournaments = catalog.tournaments;
  if (tournaments.length === 0) {
    errors.push({ scope: 'tournaments.json', message: '`tournaments` array must not be empty.' });
    return { errors, warnings };
  }

  const now = new Date();
  const staleCutoffMs = 30 * 24 * 60 * 60 * 1000;

  for (const [idx, t] of tournaments.entries()) {
    const label = t?.id || `index #${idx}`;

    // Unique ID & Slug
    if (!t.id || typeof t.id !== 'string' || !t.id.trim()) {
      errors.push({ scope: label, message: 'Missing or empty `id`.' });
    } else if (seenIds.has(t.id)) {
      errors.push({ scope: label, message: `Duplicate \`id\`: "${t.id}".` });
    } else {
      seenIds.add(t.id);
    }

    if (!t.slug || typeof t.slug !== 'string' || !t.slug.trim()) {
      errors.push({ scope: label, message: 'Missing or empty `slug`.' });
    } else if (seenSlugs.has(t.slug)) {
      errors.push({ scope: label, message: `Duplicate \`slug\`: "${t.slug}".` });
    } else {
      seenSlugs.add(t.slug);
    }

    // Required text fields
    for (const field of [
      'title',
      'englishSummary',
      'city',
      'province',
      'venueAddress',
      'organizerClub',
      'entryFee',
      'scheduleSummary',
    ]) {
      if (typeof t[field] !== 'string' || !t[field].trim()) {
        errors.push({ scope: label, message: `Missing or empty \`${field}\`.` });
      }
    }

    // Dates
    const startValid = isValidIsoDate(t.startDate);
    const endValid = isValidIsoDate(t.endDate);
    if (!startValid) {
      errors.push({ scope: label, message: `Invalid \`startDate\`: "${t.startDate}" (expected YYYY-MM-DD).` });
    }
    if (!endValid) {
      errors.push({ scope: label, message: `Invalid \`endDate\`: "${t.endDate}" (expected YYYY-MM-DD).` });
    }
    if (startValid && endValid && t.startDate > t.endDate) {
      errors.push({
        scope: label,
        message: `\`startDate\` (${t.startDate}) is after \`endDate\` (${t.endDate}).`,
      });
    }
    if (endValid) {
      const endMs = Date.parse(`${t.endDate}T23:59:59Z`);
      if (now.getTime() - endMs > staleCutoffMs) {
        warnings.push({
          scope: label,
          message: `Tournament "${t.title}" ended on ${t.endDate} (>30 days ago) — consider archiving or refreshing for next season.`,
        });
      }
    }

    // Enums
    if (!VALID_TIME_CONTROLS.has(t.timeControl)) {
      errors.push({ scope: label, message: `Invalid \`timeControl\`: "${t.timeControl}".` });
    }
    if (!VALID_CATEGORIES.has(t.category)) {
      errors.push({ scope: label, message: `Invalid \`category\`: "${t.category}".` });
    }
    if (!VALID_CIRCUITS.has(t.circuit)) {
      errors.push({ scope: label, message: `Invalid \`circuit\`: "${t.circuit}".` });
    }
    if (!VALID_REGIONS.has(t.region)) {
      errors.push({ scope: label, message: `Invalid \`region\`: "${t.region}".` });
    }

    // Rounds
    if (!Number.isInteger(t.rounds) || t.rounds < 1 || t.rounds > 25) {
      errors.push({ scope: label, message: `Invalid \`rounds\`: ${t.rounds} (expected integer 1–25).` });
    }

    // Belgian postal code (1000–9999)
    if (typeof t.postalCode !== 'string' || !/^[1-9]\d{3}$/.test(t.postalCode)) {
      errors.push({
        scope: label,
        message: `Invalid Belgian \`postalCode\`: "${t.postalCode}" (expected 1000–9999).`,
      });
    }

    // Belgian bounding box coordinates
    if (typeof t.lat !== 'number' || Number.isNaN(t.lat) || t.lat < 49.4 || t.lat > 51.6) {
      errors.push({
        scope: label,
        message: `Latitude \`lat\` (${t.lat}) is outside Belgium [49.4, 51.6].`,
      });
    }
    if (typeof t.lng !== 'number' || Number.isNaN(t.lng) || t.lng < 2.4 || t.lng > 6.5) {
      errors.push({
        scope: label,
        message: `Longitude \`lng\` (${t.lng}) is outside Belgium [2.4, 6.5].`,
      });
    }

    // Arrays
    if (!Array.isArray(t.ageGroups) || t.ageGroups.length === 0) {
      errors.push({ scope: label, message: '`ageGroups` must be a non-empty array.' });
    }
    if (!Array.isArray(t.sources) || t.sources.length === 0) {
      errors.push({ scope: label, message: '`sources` must be a non-empty array.' });
    }

    // URLs
    for (const urlField of ['officialUrl', 'flyerUrl', 'chessResultsUrl']) {
      if (!isValidHttpUrl(t[urlField])) {
        errors.push({
          scope: label,
          message: `Invalid URL in \`${urlField}\`: "${t[urlField]}".`,
        });
      }
    }
  }

  return { errors, warnings };
}

async function fetchUrlWithRetry(url, timeoutMs = 10000) {
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; BelgianChessHubVerifier/1.0; +https://github.com/weidu-tpvision/belgian-chess-tournament-hub)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en,nl;q=0.9,fr;q=0.8',
        },
      });
      clearTimeout(timer);

      let textSnippet = '';
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && /text\/html|text\/plain|application\/xhtml/i.test(contentType)) {
        const html = await res.text();
        const $ = cheerio.load(html.slice(0, 250000));
        $('script, style, noscript').remove();
        textSnippet = $('body').text().replace(/\s+/g, ' ').trim();
      }
      return { ok: res.ok, status: res.status, finalUrl: res.url, textSnippet, error: null };
    } catch (err) {
      clearTimeout(timer);
      lastError = err?.name === 'AbortError' ? `Timeout after ${timeoutMs}ms` : String(err?.message || err);
    }
  }
  return { ok: false, status: 0, finalUrl: url, textSnippet: '', error: lastError };
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIdx = 0;

  async function run() {
    while (nextIdx < items.length) {
      const current = nextIdx++;
      results[current] = await worker(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => run());
  await Promise.all(workers);
  return results;
}

function normalizeForMatch(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

async function runLiveChecks(tournaments) {
  const errors = [];
  const warnings = [];
  const urlUsage = new Map();

  for (const t of tournaments) {
    for (const field of ['officialUrl', 'flyerUrl', 'chessResultsUrl']) {
      const url = t[field];
      if (!isValidHttpUrl(url)) continue;
      if (!urlUsage.has(url)) urlUsage.set(url, []);
      urlUsage.get(url).push({ id: t.id, title: t.title, field });
    }
  }

  for (const hub of FEDERATION_HUBS) {
    if (!urlUsage.has(hub.url)) urlUsage.set(hub.url, []);
  }

  const uniqueUrls = Array.from(urlUsage.keys());
  const urlResults = new Map();

  await mapWithConcurrency(uniqueUrls, 5, async (url) => {
    const result = await fetchUrlWithRetry(url);
    urlResults.set(url, result);
  });

  // 1. Check tournament links
  for (const [url, usages] of urlUsage.entries()) {
    if (usages.length === 0) continue; // Hub-only URL checked below
    const res = urlResults.get(url);
    const affected = usages.map((u) => `${u.id} (${u.field})`).join(', ');

    if (res.status === 404 || res.status === 410) {
      errors.push({
        scope: 'dead-link',
        message: `HTTP ${res.status} for ${url} — used by: ${affected}`,
      });
    } else if (!res.ok) {
      const reason = res.status ? `HTTP ${res.status}` : res.error || 'Network error';
      warnings.push({
        scope: 'link-warning',
        message: `${reason} for ${url} — used by: ${affected}`,
      });
    }
  }

  // 2. Content sanity check on reachable officialUrl for upcoming tournaments
  const todayIso = new Date().toISOString().slice(0, 10);
  for (const t of tournaments) {
    if (!t.endDate || t.endDate < todayIso) continue;
    const res = urlResults.get(t.officialUrl);
    if (!res || !res.ok || !res.textSnippet || res.textSnippet.length < 100) continue;

    const normalizedPage = normalizeForMatch(res.textSnippet);
    const normalizedCity = normalizeForMatch(t.city || '');
    const year = t.startDate.slice(0, 4);
    const cityAliases = [normalizedCity];
    if (normalizedCity === 'bruges') cityAliases.push('brugge');
    if (normalizedCity === 'ghent') cityAliases.push('gent');
    if (normalizedCity === 'ostend') cityAliases.push('oostende');
    if (normalizedCity === 'antwerp') cityAliases.push('antwerpen');
    if (normalizedCity === 'brussels') cityAliases.push('bruxelles', 'brussel');
    if (normalizedCity === 'louvain-la-neuve') cityAliases.push('lln');

    const hasCity = cityAliases.some((alias) => alias && normalizedPage.includes(alias));
    const hasPostal = Boolean(t.postalCode && normalizedPage.includes(t.postalCode));
    const hasYear = normalizedPage.includes(year);

    if (!hasCity && !hasPostal && !hasYear) {
      warnings.push({
        scope: t.id,
        message: `Content drift check: neither city ("${t.city}"), postal code ("${t.postalCode}"), nor year ("${year}") was found on ${t.officialUrl}. Please verify the page still matches "${t.title}".`,
      });
    }
  }

  // 3. Federation hub summary
  const hubStatuses = FEDERATION_HUBS.map((hub) => {
    const res = urlResults.get(hub.url);
    return {
      name: hub.name,
      url: hub.url,
      ok: Boolean(res?.ok),
      status: res?.status || 0,
      error: res?.error || null,
    };
  });

  for (const hub of hubStatuses) {
    if (!hub.ok) {
      warnings.push({
        scope: 'federation-hub',
        message: `Federation hub unreachable: ${hub.name} (${hub.url}) — ${hub.status ? `HTTP ${hub.status}` : hub.error}`,
      });
    }
  }

  return {
    errors,
    warnings,
    checkedUrlCount: uniqueUrls.length,
    hubStatuses,
  };
}

function buildMarkdownReport({
  mode,
  seedVersion,
  tournamentCount,
  staticErrors,
  staticWarnings,
  liveResult,
}) {
  const lines = [];
  const totalErrors = staticErrors.length + (liveResult?.errors.length || 0);
  const totalWarnings = staticWarnings.length + (liveResult?.warnings.length || 0);
  const statusBadge =
    totalErrors > 0 ? '❌ Action Required' : totalWarnings > 0 ? '⚠️ Warnings Found' : '✅ All Checks Passed';

  lines.push(`# Belgian Chess Tournament Accuracy Report`);
  lines.push('');
  lines.push(`- **Status:** ${statusBadge}`);
  lines.push(`- **Mode:** \`${mode}\``);
  lines.push(`- **Seed Version:** \`v${seedVersion}\``);
  lines.push(`- **Checked at:** ${new Date().toISOString()}`);
  lines.push(`- **Tournaments verified:** ${tournamentCount}`);
  if (liveResult) {
    lines.push(`- **Unique URLs checked:** ${liveResult.checkedUrlCount}`);
  }
  lines.push(`- **Errors:** ${totalErrors} | **Warnings:** ${totalWarnings}`);
  lines.push('');

  if (staticErrors.length > 0) {
    lines.push('## ❌ Static Data Validation Errors');
    for (const err of staticErrors) {
      lines.push(`- **\`${err.scope}\`**: ${err.message}`);
    }
    lines.push('');
  }

  if (liveResult && liveResult.errors.length > 0) {
    lines.push('## ❌ Live Link Errors (404 / 410)');
    for (const err of liveResult.errors) {
      lines.push(`- **\`${err.scope}\`**: ${err.message}`);
    }
    lines.push('');
  }

  const allWarnings = [...staticWarnings, ...(liveResult?.warnings || [])];
  if (allWarnings.length > 0) {
    lines.push('## ⚠️ Warnings & Review Items');
    for (const warn of allWarnings) {
      lines.push(`- **\`${warn.scope}\`**: ${warn.message}`);
    }
    lines.push('');
  }

  if (liveResult) {
    lines.push('## 🏛️ Belgian Federation Sources');
    lines.push('| Source | Status | URL |');
    lines.push('| :--- | :--- | :--- |');
    for (const hub of liveResult.hubStatuses) {
      const icon = hub.ok ? `✅ HTTP ${hub.status}` : `⚠️ ${hub.status ? `HTTP ${hub.status}` : hub.error}`;
      lines.push(`| ${hub.name} | ${icon} | ${hub.url} |`);
    }
    lines.push('');
  }

  if (totalErrors === 0 && totalWarnings === 0) {
    lines.push('All tournament metadata, dates, Belgian postal codes/coordinates, and external sources passed verification.');
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const catalog = loadCatalog();
  const tournaments = catalog.tournaments;

  const { errors: staticErrors, warnings: staticWarnings } = validateStatic(catalog);
  const liveResult = args.live ? await runLiveChecks(tournaments) : null;

  const report = buildMarkdownReport({
    mode: args.live ? 'static+live' : 'static',
    seedVersion: catalog.seedVersion,
    tournamentCount: tournaments.length,
    staticErrors,
    staticWarnings,
    liveResult,
  });

  console.log(report);

  if (args.reportFile) {
    fs.writeFileSync(path.resolve(ROOT_DIR, args.reportFile), report, 'utf-8');
  }

  const summary = {
    mode: args.live ? 'static+live' : 'static',
    seedVersion: catalog.seedVersion,
    checkedAt: new Date().toISOString(),
    tournamentCount: tournaments.length,
    staticErrorCount: staticErrors.length,
    liveErrorCount: liveResult?.errors.length || 0,
    errorCount: staticErrors.length + (liveResult?.errors.length || 0),
    warningCount: staticWarnings.length + (liveResult?.warnings.length || 0),
  };

  if (args.jsonFile) {
    fs.writeFileSync(path.resolve(ROOT_DIR, args.jsonFile), JSON.stringify(summary, null, 2), 'utf-8');
  }

  const shouldFail =
    staticErrors.length > 0 || (args.failOnLiveErrors && (liveResult?.errors.length || 0) > 0);
  if (shouldFail) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((err) => {
    console.error('Verification script crashed:', err);
    process.exitCode = 1;
  });
}
