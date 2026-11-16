export type TournamentCategory = 'youth' | 'open' | 'both';
export type TimeControlType = 'standard' | 'rapid' | 'blitz';
export type CircuitType = 'JEF' | 'VSF_YOUTH' | 'NATIONAL' | 'OPEN' | 'NONE';
export type RegionType = 'Flanders' | 'Wallonia' | 'Brussels';
export type BookmarkStatus = 'interested' | 'registered' | 'played' | 'skipped';

export interface Tournament {
  id: string;
  slug: string;
  title: string;
  englishSummary: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  rounds: number;
  timeControl: TimeControlType;
  timeControlDetails: string;
  category: TournamentCategory;
  circuit: CircuitType;
  ageGroups: string[]; // e.g., ["U8", "U10", "U12", "U14", "U16", "U20", "Open"]
  city: string;
  postalCode: string;
  province: string;
  region: RegionType;
  venueAddress: string;
  lat: number;
  lng: number;
  organizerClub: string;
  clubMatricule: string;
  entryFee: string;
  scheduleSummary: string;
  officialUrl: string;
  flyerUrl: string;
  chessResultsUrl: string;
  chessResultsTnr: string;
  registeredPlayersCount: number;
  isFideRated: boolean;
  isNationalRated: boolean;
  sources: string[];
  updatedAt: string;
  // Computed client/API fields
  distanceKm?: number;
  estimatedDriveMinutes?: number;
  bookmark?: UserBookmark | null;
}

export interface UserBookmark {
  tournamentId: string;
  status: BookmarkStatus;
  section: string; // e.g., "U10", "Open B", "Rapid"
  notes: string;
  updatedAt: string;
}

export interface PlayerProfile {
  id: string;
  fullName: string;
  birthYear: number;
  belgianMatricule: string;
  fideId: string;
  clubName: string;
  clubMatricule: string;
  belgianElo: number;
  fideStandardElo: number;
  fideRapidElo: number;
  fideBlitzElo: number;
  homeCity: string;
  homePostalCode: string;
  homeLat: number;
  homeLng: number;
  updatedAt: string;
}

export interface RoundPairing {
  round: number;
  date: string;
  board: number;
  color: 'W' | 'B';
  opponentName: string;
  opponentElo: number;
  opponentClub: string;
  result: '1-0' | '0-1' | '½-½' | 'Pending';
  pointsForPlayer: number;
}

export interface PlayerTournamentEntry {
  id: string;
  chessResultsTnr: string;
  tournamentTitle: string;
  city: string;
  date: string;
  sectionName: string;
  timeControl: TimeControlType;
  totalRounds: number;
  completedRounds: number;
  points: number;
  currentRank: number;
  startingRank: number;
  totalPlayers: number;
  performanceRating: number;
  eloChange: number;
  chessResultsUrl: string;
  pairings: RoundPairing[];
  lastSyncedAt: string;
}

export interface SyncLog {
  id: string;
  source: string;
  status: 'success' | 'partial' | 'fallback';
  itemsProcessed: number;
  newEventsAdded: number;
  startedAt: string;
  completedAt: string;
  message: string;
}
