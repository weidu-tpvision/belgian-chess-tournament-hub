import fs from 'node:fs';
import path from 'node:path';
import {
  Tournament,
  UserBookmark,
  PlayerProfile,
  PlayerTournamentEntry,
  SyncLog,
} from './schema';
import {
  INITIAL_TOURNAMENTS,
  INITIAL_BOOKMARKS,
  INITIAL_PLAYER_PROFILE,
  INITIAL_PLAYER_ENTRIES,
  INITIAL_SYNC_LOGS,
} from './seed-data';
import { calculateHaversineKm, estimateDriveMinutes } from '@/lib/belgium-geo';

interface DatabaseStore {
  tournaments: Tournament[];
  bookmarks: UserBookmark[];
  playerProfile: PlayerProfile;
  playerEntries: PlayerTournamentEntry[];
  syncLogs: SyncLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_JSON_PATH = path.join(DATA_DIR, 'chess-hub-db.json');

function ensureStore(): DatabaseStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_JSON_PATH)) {
    const initial: DatabaseStore = {
      tournaments: INITIAL_TOURNAMENTS,
      bookmarks: INITIAL_BOOKMARKS,
      playerProfile: INITIAL_PLAYER_PROFILE,
      playerEntries: INITIAL_PLAYER_ENTRIES,
      syncLogs: INITIAL_SYNC_LOGS,
    };
    fs.writeFileSync(DB_JSON_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_JSON_PATH, 'utf-8');
    return JSON.parse(raw) as DatabaseStore;
  } catch {
    return {
      tournaments: INITIAL_TOURNAMENTS,
      bookmarks: INITIAL_BOOKMARKS,
      playerProfile: INITIAL_PLAYER_PROFILE,
      playerEntries: INITIAL_PLAYER_ENTRIES,
      syncLogs: INITIAL_SYNC_LOGS,
    };
  }
}

function saveStore(store: DatabaseStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_JSON_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

export function getAllTournamentsEnriched(): Tournament[] {
  const store = ensureStore();
  const profile = store.playerProfile;
  const bookmarkMap = new Map<string, UserBookmark>();
  for (const b of store.bookmarks) {
    bookmarkMap.set(b.tournamentId, b);
  }

  return store.tournaments
    .map((t) => {
      const distanceKm = calculateHaversineKm(
        profile.homeLat,
        profile.homeLng,
        t.lat,
        t.lng
      );
      const estimatedDriveMinutes = estimateDriveMinutes(distanceKm);
      return {
        ...t,
        distanceKm,
        estimatedDriveMinutes,
        bookmark: bookmarkMap.get(t.id) || null,
      };
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function upsertTournaments(incoming: Tournament[]): {
  added: number;
  updated: number;
} {
  const store = ensureStore();
  let added = 0;
  let updated = 0;

  for (const item of incoming) {
    const existingIdx = store.tournaments.findIndex(
      (t) =>
        t.id === item.id ||
        (t.chessResultsTnr &&
          item.chessResultsTnr &&
          t.chessResultsTnr === item.chessResultsTnr) ||
        (t.startDate === item.startDate &&
          t.postalCode === item.postalCode &&
          t.category === item.category)
    );

    if (existingIdx >= 0) {
      const existing = store.tournaments[existingIdx];
      const mergedSources = Array.from(
        new Set([...existing.sources, ...item.sources])
      );
      store.tournaments[existingIdx] = {
        ...existing,
        ...item,
        id: existing.id,
        sources: mergedSources,
        updatedAt: new Date().toISOString(),
      };
      updated++;
    } else {
      store.tournaments.push(item);
      added++;
    }
  }

  saveStore(store);
  return { added, updated };
}

export function upsertBookmark(bookmark: UserBookmark): UserBookmark {
  const store = ensureStore();
  const idx = store.bookmarks.findIndex(
    (b) => b.tournamentId === bookmark.tournamentId
  );
  const record: UserBookmark = {
    ...bookmark,
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) {
    store.bookmarks[idx] = record;
  } else {
    store.bookmarks.push(record);
  }
  saveStore(store);
  return record;
}

export function removeBookmark(tournamentId: string): void {
  const store = ensureStore();
  store.bookmarks = store.bookmarks.filter(
    (b) => b.tournamentId !== tournamentId
  );
  saveStore(store);
}

export function getPlayerProfile(): PlayerProfile {
  return ensureStore().playerProfile;
}

export function updatePlayerProfile(
  partial: Partial<PlayerProfile>
): PlayerProfile {
  const store = ensureStore();
  store.playerProfile = {
    ...store.playerProfile,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  saveStore(store);
  return store.playerProfile;
}

export function getPlayerEntries(): PlayerTournamentEntry[] {
  return ensureStore().playerEntries;
}

export function upsertPlayerEntry(entry: PlayerTournamentEntry): void {
  const store = ensureStore();
  const idx = store.playerEntries.findIndex(
    (e) => e.chessResultsTnr === entry.chessResultsTnr
  );
  if (idx >= 0) {
    store.playerEntries[idx] = entry;
  } else {
    store.playerEntries.unshift(entry);
  }
  saveStore(store);
}

export function getSyncLogs(): SyncLog[] {
  return ensureStore().syncLogs;
}

export function appendSyncLogs(logs: SyncLog[]): void {
  const store = ensureStore();
  store.syncLogs = [...logs, ...store.syncLogs].slice(0, 25);
  saveStore(store);
}
