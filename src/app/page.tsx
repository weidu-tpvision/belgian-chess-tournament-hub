'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Compass,
  Download,
  ExternalLink,
  Filter,
  MapPin,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
  Clock,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import BelgiumMap from '@/components/BelgiumMap';
import {
  Tournament,
  PlayerProfile,
  PlayerTournamentEntry,
  SyncLog,
  BookmarkStatus,
} from '@/db/schema';
import {
  INITIAL_TOURNAMENTS,
  INITIAL_PLAYER_PROFILE,
  INITIAL_PLAYER_ENTRIES,
  INITIAL_SYNC_LOGS,
} from '@/db/seed-data';
import {
  BELGIAN_LOCATIONS,
  getBelgianAgeCategory,
  isSectionMatchingPlayer,
} from '@/lib/belgium-geo';
import { BELGIAN_CLUBS_BY_MATRICULE } from '@/lib/scrapers/frbe';

type ActiveTab = 'finder' | 'map' | 'schedule' | 'player' | 'sources';

export default function BelgianChessHubPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('finder');
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(
    INITIAL_PLAYER_PROFILE
  );
  const [playerEntries, setPlayerEntries] = useState<PlayerTournamentEntry[]>(
    INITIAL_PLAYER_ENTRIES
  );
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(INITIAL_SYNC_LOGS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncBanner, setSyncBanner] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'youth' | 'both' | 'open'
  >('all');
  const [circuitFilter, setCircuitFilter] = useState<string>('ALL');
  const [timeControlFilter, setTimeControlFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(250);
  const [u10OnlyToggle, setU10OnlyToggle] = useState<boolean>(false);
  const [showFiltersExpanded, setShowFiltersExpanded] = useState<boolean>(false);

  // Selected tournament for Map / Details
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(
    INITIAL_TOURNAMENTS[0]?.id || null
  );

  // Add Custom Tournament Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCity, setNewCity] = useState('1000');
  const [newStartDate, setNewStartDate] = useState('2027-01-31');
  const [newEndDate, setNewEndDate] = useState('2027-01-31');
  const [newCategory, setNewCategory] = useState<'youth' | 'both' | 'open'>('both');
  const [newTimeControl, setNewTimeControl] = useState<'rapid' | 'standard' | 'blitz'>('rapid');
  const [newRounds, setNewRounds] = useState(7);
  const [newTnr, setNewTnr] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  const [newOrganizerClub, setNewOrganizerClub] = useState('');
  const [newEntryFee, setNewEntryFee] = useState('€10');
  const [newOfficialUrl, setNewOfficialUrl] = useState('');
  const [newIsFideRated, setNewIsFideRated] = useState(false);

  // Player Profile Form State
  const [profileForm, setProfileForm] = useState<PlayerProfile>(
    INITIAL_PLAYER_PROFILE
  );
  const [tnrLookupInput, setTnrLookupInput] = useState('1048291');
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);
  const [isLookingUpFederation, setIsLookingUpFederation] = useState(false);

  // Dynamic Age Category & Max Rating
  const { age: playerAge, ageCategory: ageCategoryLabel } = useMemo(
    () => getBelgianAgeCategory(playerProfile.birthYear),
    [playerProfile.birthYear]
  );

  const playerMaxElo = useMemo(
    () =>
      Math.max(
        playerProfile.belgianElo || 0,
        playerProfile.fideRapidElo || 0,
        playerProfile.fideStandardElo || 0
      ),
    [
      playerProfile.belgianElo,
      playerProfile.fideRapidElo,
      playerProfile.fideStandardElo,
    ]
  );

  // Load enriched data from backend on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [tourRes, playerRes, syncRes] = await Promise.all([
          fetch('/api/tournaments'),
          fetch('/api/player'),
          fetch('/api/sync'),
        ]);
        if (tourRes.ok) {
          const data = await tourRes.json();
          if (data.tournaments) setTournaments(data.tournaments);
        }
        if (playerRes.ok) {
          const pData = await playerRes.json();
          if (pData.profile) {
            setPlayerProfile(pData.profile);
            setProfileForm(pData.profile);
          }
          if (pData.entries) setPlayerEntries(pData.entries);
        }
        if (syncRes.ok) {
          const sData = await syncRes.json();
          if (sData.logs) setSyncLogs(sData.logs);
        }
      } catch {
        // Fallback to initial state if offline
      }
    }
    loadInitialData();
  }, []);

  // Filtered tournaments
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCity = t.city.toLowerCase().includes(q);
        const matchClub = t.organizerClub.toLowerCase().includes(q);
        const matchSummary = t.englishSummary.toLowerCase().includes(q);
        if (!matchTitle && !matchCity && !matchClub && !matchSummary) return false;
      }

      if (categoryFilter === 'youth' && t.category !== 'youth' && t.category !== 'both') {
        return false;
      }
      if (categoryFilter === 'both' && t.category !== 'both') {
        return false;
      }
      if (categoryFilter === 'open' && t.category !== 'open' && t.category !== 'both') {
        return false;
      }

      if (circuitFilter !== 'ALL' && t.circuit !== circuitFilter) {
        return false;
      }

      if (timeControlFilter !== 'ALL' && t.timeControl !== timeControlFilter) {
        return false;
      }

      if (regionFilter !== 'ALL' && t.region !== regionFilter) {
        return false;
      }

      if (maxDistanceKm < 250 && (t.distanceKm ?? 0) > maxDistanceKm) {
        return false;
      }

      if (u10OnlyToggle) {
        const hasEligibleSection = t.ageGroups.some((g) =>
          isSectionMatchingPlayer(g, ageCategoryLabel, playerMaxElo)
        );
        if (!hasEligibleSection) return false;
      }

      return true;
    });
  }, [
    tournaments,
    searchQuery,
    categoryFilter,
    circuitFilter,
    timeControlFilter,
    regionFilter,
    maxDistanceKm,
    u10OnlyToggle,
    ageCategoryLabel,
    playerMaxElo,
  ]);

  const selectedTournament = useMemo(() => {
    return (
      filteredTournaments.find((t) => t.id === selectedTournamentId) ||
      filteredTournaments[0] ||
      null
    );
  }, [filteredTournaments, selectedTournamentId]);

  const bookmarkedTournaments = useMemo(() => {
    return tournaments.filter(
      (t) =>
        t.bookmark &&
        (t.bookmark.status === 'registered' || t.bookmark.status === 'interested')
    );
  }, [tournaments]);

  // Detect overlapping dates among bookmarked tournaments
  const scheduleConflicts = useMemo(() => {
    const conflicts: string[] = [];
    for (let i = 0; i < bookmarkedTournaments.length; i++) {
      for (let j = i + 1; j < bookmarkedTournaments.length; j++) {
        const a = bookmarkedTournaments[i];
        const b = bookmarkedTournaments[j];
        if (a.startDate <= b.endDate && b.startDate <= a.endDate) {
          conflicts.push(
            `Date overlap on ${a.startDate}: "${a.title}" (${a.city}) overlaps with "${b.title}" (${b.city}).`
          );
        }
      }
    }
    return conflicts;
  }, [bookmarkedTournaments]);

  function getDefaultSectionForTournament(t: Tournament): string {
    return (
      t.ageGroups.find((g) =>
        isSectionMatchingPlayer(g, ageCategoryLabel, playerMaxElo)
      ) ||
      t.ageGroups[0] ||
      ageCategoryLabel
    );
  }

  async function handleBookmarkToggle(
    tournamentId: string,
    status: BookmarkStatus | null,
    section: string = ageCategoryLabel,
    notes?: string
  ) {
    try {
      const existingBookmark = tournaments.find(
        (t) => t.id === tournamentId
      )?.bookmark;
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId,
          status,
          section: section || existingBookmark?.section || ageCategoryLabel,
          notes: notes !== undefined ? notes : existingBookmark?.notes || '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTournaments(data.tournaments);
      }
    } catch {
      // Optimistic local fallback
    }
  }

  async function handleRunLiveSync() {
    setIsSyncing(true);
    setSyncBanner(null);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTournaments(data.tournaments);
        setSyncLogs(data.logs);
        setSyncBanner(
          `Synced FRBE-KBSB, VSF Jeugdschaakcriterium, FEFB Circuit JEF, and Chess-Results BEL (${data.totalAdded} new events added, ${data.totalUpdated} updated).`
        );
      }
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleCreateCustomTournament(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        postalCode: newCity,
        startDate: newStartDate,
        endDate: newEndDate && newEndDate >= newStartDate ? newEndDate : newStartDate,
        category: newCategory,
        timeControl: newTimeControl,
        rounds: newRounds,
        chessResultsTnr: newTnr,
        venueAddress: newVenueAddress || undefined,
        organizerClub: newOrganizerClub || undefined,
        entryFee: newEntryFee || '€10',
        officialUrl: newOfficialUrl || undefined,
        isFideRated: newIsFideRated,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setTournaments(data.tournaments);
      setSelectedTournamentId(data.tournament.id);
      setShowAddModal(false);
      setNewTitle('');
      setNewTnr('');
      setNewVenueAddress('');
      setNewOrganizerClub('');
      setNewOfficialUrl('');
    }
  }

  async function handleSavePlayerProfile(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/player', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    });
    if (res.ok) {
      const data = await res.json();
      setPlayerProfile(data.profile);
      setProfileForm(data.profile);
      setTournaments(data.tournaments);
      setProfileSavedMsg(
        `Saved profile (${data.profile.fullName}) & recalculated driving distances from ${data.profile.homeCity} (${data.profile.homePostalCode}).`
      );
      setTimeout(() => setProfileSavedMsg(null), 5000);
    }
  }

  async function handleLookupFederationProfile() {
    setIsLookingUpFederation(true);
    try {
      const res = await fetch('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lookup-federation',
          belgianMatricule: profileForm.belgianMatricule,
          fideId: profileForm.fideId,
          fullName: profileForm.fullName,
          clubMatricule: profileForm.clubMatricule,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profilePatch) {
          const nextPostal =
            data.profilePatch.homePostalCode || profileForm.homePostalCode;
          const nextCity =
            BELGIAN_LOCATIONS[nextPostal]?.city || profileForm.homeCity;
          setProfileForm((prev) => ({
            ...prev,
            ...data.profilePatch,
            homePostalCode: nextPostal,
            homeCity: nextCity,
          }));
          setProfileSavedMsg(
            `${data.sourceMessage} Click "Save Player Profile" below to apply.`
          );
        }
      }
    } finally {
      setIsLookingUpFederation(false);
    }
  }

  async function handleImportChessResultsTnr(e: React.FormEvent) {
    e.preventDefault();
    if (!tnrLookupInput.trim()) return;
    const res = await fetch('/api/player', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chessResultsTnr: tnrLookupInput }),
    });
    if (res.ok) {
      const data = await res.json();
      setPlayerEntries(data.entries);
    }
  }

  return (
    <div>
      {/* Top Masthead */}
      <header className="app-masthead">
        <div className="masthead-inner">
          <div className="brand-group">
            <div className="belgium-flag-emblem" aria-hidden="true">
              <span className="flag-stripe flag-black" />
              <span className="flag-stripe flag-yellow" />
              <span className="flag-stripe flag-red" />
            </div>
            <div className="brand-titles">
              <h1>Belgian Chess Tournament Hub</h1>
              <p className="brand-subtitle">
                FRBE-KBSB • VSF Jeugdschaakcriterium • FEFB Circuit JEF • SVDB • Chess-Results BEL
              </p>
            </div>
          </div>

          {/* Player Summary Pill */}
          <div className="player-ribbon">
            <div className="player-chip-main">
              <span className="player-chip-name">
                {playerProfile.fullName} ({playerAge} yo)
                <span className="age-cat-badge">{ageCategoryLabel}</span>
              </span>
              <span className="player-chip-meta">
                Matricule #{playerProfile.belgianMatricule} • FIDE #{playerProfile.fideId} • Club #{playerProfile.clubMatricule} • Base: {playerProfile.homeCity} ({playerProfile.homePostalCode})
              </span>
            </div>
            <div className="elo-mini-pills">
              <span className="elo-pill">
                BEL <strong>{playerProfile.belgianElo}</strong>
              </span>
              <span className="elo-pill">
                Rapid <strong>{playerProfile.fideRapidElo}</strong>
              </span>
              <span className="elo-pill">
                Std <strong>{playerProfile.fideStandardElo}</strong>
              </span>
              <span className="elo-pill">
                Blitz <strong>{playerProfile.fideBlitzElo}</strong>
              </span>
            </div>
          </div>

          <div className="masthead-actions">
            <button
              id="btn-add-tournament"
              type="button"
              className="btn-masthead"
              onClick={() => setShowAddModal(true)}
            >
              <PlusCircle size={15} />
              Add Flyer / Event
            </button>
            <button
              id="btn-sync-sources"
              type="button"
              className="btn-masthead btn-masthead-primary"
              onClick={handleRunLiveSync}
              disabled={isSyncing}
            >
              <RefreshCw size={15} className={isSyncing ? 'spin' : ''} />
              {isSyncing ? 'Syncing Belgium Sources...' : 'Sync Federation Calendars'}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-tabs-bar" aria-label="Primary Sections">
        <div className="nav-tabs-inner">
          <div className="nav-tabs-list">
            <button
              id="tab-finder"
              type="button"
              className={`nav-tab-btn ${activeTab === 'finder' ? 'active' : ''}`}
              onClick={() => setActiveTab('finder')}
            >
              <Compass size={16} />
              Tournament Finder
              <span className="tab-count-pill">{filteredTournaments.length}</span>
            </button>
            <button
              id="tab-map"
              type="button"
              className={`nav-tab-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              <MapPin size={16} />
              Interactive Map
              <span className="tab-count-pill">{filteredTournaments.length}</span>
            </button>
            <button
              id="tab-schedule"
              type="button"
              className={`nav-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <Calendar size={16} />
              My Schedule & iCal
              <span className="tab-count-pill">{bookmarkedTournaments.length}</span>
            </button>
            <button
              id="tab-player"
              type="button"
              className={`nav-tab-btn ${activeTab === 'player' ? 'active' : ''}`}
              onClick={() => setActiveTab('player')}
            >
              <Trophy size={16} />
              Player Profile & Chess-Results Tracker
              <span className="tab-count-pill">{playerEntries.length}</span>
            </button>
            <button
              id="tab-sources"
              type="button"
              className={`nav-tab-btn ${activeTab === 'sources' ? 'active' : ''}`}
              onClick={() => setActiveTab('sources')}
            >
              <ShieldCheck size={16} />
              Belgian Data Sources & Sync Logs
            </button>
          </div>

          <div className="federation-sources-strip">
            <span className="source-dot" />
            <span>
              Home radius from <strong>{playerProfile.homeCity} ({playerProfile.homePostalCode})</strong>
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-container">
        {syncBanner && (
          <div
            style={{
              background: 'var(--accent-forest-soft)',
              border: '1px solid var(--accent-forest)',
              color: 'var(--accent-forest)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            <span>{syncBanner}</span>
            <button
              type="button"
              onClick={() => setSyncBanner(null)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* SHARED FILTER BAR FOR TOURNAMENT FINDER & INTERACTIVE MAP */}
        {(activeTab === 'finder' || activeTab === 'map') && (
          <section className="filter-panel" aria-label="Tournament Filters">
            {!showFiltersExpanded ? (
              <div
                id="btn-expand-filters"
                role="button"
                tabIndex={0}
                onClick={() => setShowFiltersExpanded(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowFiltersExpanded(true);
                  }
                }}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-secondary)',
                      marginRight: '0.25rem',
                    }}
                  >
                    <Filter size={14} />
                    Criteria:
                  </span>
                  {searchQuery.trim() && (
                    <span className="age-tag highlight-u10">
                      Search: &ldquo;{searchQuery.trim()}&rdquo;
                    </span>
                  )}
                  <span className="age-tag">
                    Category:{' '}
                    {categoryFilter === 'all'
                      ? `All (${playerAge}yo)`
                      : categoryFilter === 'youth'
                      ? 'Youth'
                      : categoryFilter === 'both'
                      ? 'Youth + Open'
                      : 'Mixed Open'}
                  </span>
                  <span className="age-tag">
                    Circuit: {circuitFilter === 'ALL' ? 'All' : circuitFilter}
                  </span>
                  <span className="age-tag">
                    Time:{' '}
                    {timeControlFilter === 'ALL'
                      ? 'All'
                      : timeControlFilter.toUpperCase()}
                  </span>
                  <span className="age-tag">
                    Region: {regionFilter === 'ALL' ? 'All Belgium' : regionFilter}
                  </span>
                  <span className="age-tag">
                    Distance:{' '}
                    {maxDistanceKm >= 250
                      ? 'All Belgium'
                      : `≤ ${maxDistanceKm} km from ${playerProfile.homeCity}`}
                  </span>
                  {u10OnlyToggle && (
                    <span className="age-tag highlight-u10">
                      {ageCategoryLabel} / {playerMaxElo} ELO Eligible
                    </span>
                  )}
                </div>

                <span
                  className="btn-status"
                  style={{ whiteSpace: 'nowrap', pointerEvents: 'none' }}
                >
                  Modify Search & Filters
                  <ChevronDown size={14} />
                </span>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Filter size={14} />
                    Search & Filter Criteria
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(searchQuery ||
                      categoryFilter !== 'all' ||
                      circuitFilter !== 'ALL' ||
                      timeControlFilter !== 'ALL' ||
                      regionFilter !== 'ALL' ||
                      maxDistanceKm < 250 ||
                      u10OnlyToggle) && (
                      <button
                        type="button"
                        className="btn-status"
                        onClick={() => {
                          setSearchQuery('');
                          setCategoryFilter('all');
                          setCircuitFilter('ALL');
                          setTimeControlFilter('ALL');
                          setRegionFilter('ALL');
                          setMaxDistanceKm(250);
                          setU10OnlyToggle(false);
                        }}
                      >
                        Reset
                      </button>
                    )}
                    <button
                      id="btn-collapse-filters"
                      type="button"
                      className="btn-status"
                      onClick={() => setShowFiltersExpanded(false)}
                    >
                      Hide Search & Filters
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>

                <div className="filter-grid">
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="search-input">
                      Search City, Club, or Tournament
                    </label>
                    <input
                      id="search-input"
                      type="text"
                      className="filter-input"
                      placeholder="e.g., Wavre, Mechelen, JEF, Criterium, Blankenberge..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="filter-field">
                    <label className="filter-label" htmlFor="circuit-select">
                      Circuit / Series
                    </label>
                    <select
                      id="circuit-select"
                      className="filter-select"
                      value={circuitFilter}
                      onChange={(e) => setCircuitFilter(e.target.value)}
                    >
                      <option value="ALL">All Belgian Circuits & Opens</option>
                      <option value="JEF">Circuit JEF (Francophone Youth)</option>
                      <option value="VSF_YOUTH">Vlaams Jeugdschaakcriterium</option>
                      <option value="NATIONAL">Belgian National Championship (BJK/CBJ)</option>
                      <option value="OPEN">Mixed Open Tournaments</option>
                    </select>
                  </div>

                  <div className="filter-field">
                    <label className="filter-label" htmlFor="tc-select">
                      Time Control
                    </label>
                    <select
                      id="tc-select"
                      className="filter-select"
                      value={timeControlFilter}
                      onChange={(e) => setTimeControlFilter(e.target.value)}
                    >
                      <option value="ALL">All Time Controls</option>
                      <option value="rapid">Rapid (15m+5s / 25m+10s)</option>
                      <option value="standard">Classical / Standard (90m+30s)</option>
                      <option value="blitz">Blitz (3m+2s / 5m+3s)</option>
                    </select>
                  </div>

                  <div className="filter-field">
                    <label className="filter-label" htmlFor="region-select">
                      Region
                    </label>
                    <select
                      id="region-select"
                      className="filter-select"
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                    >
                      <option value="ALL">All of Belgium</option>
                      <option value="Brussels">Brussels-Capital</option>
                      <option value="Flanders">Flanders (VSF)</option>
                      <option value="Wallonia">Wallonia & East Belgium (FEFB/SVDB)</option>
                    </select>
                  </div>

                  <div className="filter-field">
                    <label className="filter-label" htmlFor="distance-range">
                      <span>Max Distance from {playerProfile.homeCity}</span>
                      <strong>
                        {maxDistanceKm >= 250 ? 'All Belgium' : `≤ ${maxDistanceKm} km`}
                      </strong>
                    </label>
                    <input
                      id="distance-range"
                      type="range"
                      min={15}
                      max={250}
                      step={5}
                      value={maxDistanceKm}
                      onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="filter-pills-row">
                  <div className="quick-category-toggles">
                    <button
                      type="button"
                      className={`toggle-chip ${categoryFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setCategoryFilter('all')}
                    >
                      All Suitable for {playerAge}yo ({tournaments.length})
                    </button>
                    <button
                      type="button"
                      className={`toggle-chip ${categoryFilter === 'youth' ? 'active' : ''}`}
                      onClick={() => setCategoryFilter('youth')}
                    >
                      Youth Categories (U8 / U10 / U12 / U14+)
                    </button>
                    <button
                      type="button"
                      className={`toggle-chip ${categoryFilter === 'both' ? 'active' : ''}`}
                      onClick={() => setCategoryFilter('both')}
                    >
                      Combined Youth + Mixed Open
                    </button>
                    <button
                      type="button"
                      className={`toggle-chip ${categoryFilter === 'open' ? 'active' : ''}`}
                      onClick={() => setCategoryFilter('open')}
                    >
                      Mixed Open Tournaments
                    </button>
                  </div>

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={u10OnlyToggle}
                      onChange={(e) => setU10OnlyToggle(e.target.checked)}
                    />
                    Filter by {ageCategoryLabel} & Rating ({playerMaxElo} ELO) Eligibility
                  </label>
                </div>
              </>
            )}
          </section>
        )}

        {/* TAB 1: TOURNAMENT FINDER */}
        {activeTab === 'finder' && (
          <div className="tournaments-list-col">
                {filteredTournaments.map((t) => {
                  const isSelected = selectedTournament?.id === t.id;
                  const bStatus = t.bookmark?.status;

                  return (
                    <article
                      key={t.id}
                      id={`tournament-card-${t.id}`}
                      className={`tournament-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedTournamentId(t.id)}
                    >
                      <div className="card-top-meta">
                        <div className="badge-group">
                          {t.category === 'youth' && (
                            <span className="badge badge-youth">YOUTH TOURNAMENT</span>
                          )}
                          {t.category === 'both' && (
                            <span className="badge badge-both">YOUTH + MIXED OPEN</span>
                          )}
                          {t.category === 'open' && (
                            <span className="badge badge-open">MIXED OPEN</span>
                          )}

                          {t.circuit !== 'NONE' && (
                            <span className="badge badge-circuit">
                              {t.circuit === 'VSF_YOUTH'
                                ? 'VLAAMS JEUGDCRITERIUM'
                                : t.circuit === 'JEF'
                                ? 'CIRCUIT JEF'
                                : t.circuit === 'NATIONAL'
                                ? 'BELGIAN CHAMPIONSHIP'
                                : 'OPEN CIRCUIT'}
                            </span>
                          )}

                          {t.isFideRated && (
                            <span className="badge badge-fide">FIDE ELO</span>
                          )}
                          {t.isNationalRated && !t.isFideRated && (
                            <span className="badge badge-open">BELGIAN ELO</span>
                          )}
                        </div>

                        <span className="distance-pill">
                          {t.distanceKm} km • ~{t.estimatedDriveMinutes} min drive
                        </span>
                      </div>

                      <h2 className="card-title">{t.title}</h2>
                      <p className="card-summary">{t.englishSummary}</p>

                      <div className="card-specs-grid">
                        <div className="spec-cell">
                          <span className="spec-label">Date</span>
                          <span className="spec-value">
                            {t.startDate === t.endDate
                              ? t.startDate
                              : `${t.startDate} → ${t.endDate.slice(5)}`}
                          </span>
                        </div>
                        <div className="spec-cell">
                          <span className="spec-label">City & Region</span>
                          <span className="spec-value">
                            {t.city} ({t.postalCode})
                          </span>
                        </div>
                        <div className="spec-cell">
                          <span className="spec-label">Format</span>
                          <span className="spec-value">
                            {t.rounds}R • {t.timeControl.toUpperCase()}
                          </span>
                        </div>
                        <div className="spec-cell">
                          <span className="spec-label">Time Control</span>
                          <span className="spec-value">{t.timeControlDetails}</span>
                        </div>
                      </div>

                      <div className="age-groups-row">
                        <span
                          style={{
                            fontSize: '0.73rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            marginRight: '0.2rem',
                          }}
                        >
                          Sections:
                        </span>
                        {t.ageGroups.map((ag) => (
                          <span
                            key={ag}
                            className={`age-tag ${
                              isSectionMatchingPlayer(
                                ag,
                                ageCategoryLabel,
                                playerMaxElo
                              )
                                ? 'highlight-u10'
                                : ''
                            }`}
                          >
                            {ag}
                          </span>
                        ))}
                        <span
                          style={{
                            marginLeft: 'auto',
                            fontSize: '0.74rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          Entry: <strong>{t.entryFee}</strong>
                        </span>
                      </div>

                      <div
                        className="card-footer-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bookmark-btn-group">
                          <button
                            type="button"
                            className={`btn-status ${
                              bStatus === 'registered' ? 'active-registered' : ''
                            }`}
                            onClick={() =>
                              handleBookmarkToggle(
                                t.id,
                                bStatus === 'registered' ? null : 'registered',
                                t.bookmark?.section || getDefaultSectionForTournament(t)
                              )
                            }
                          >
                            <CheckCircle2 size={14} />
                            {bStatus === 'registered' ? 'Registered' : 'Mark Registered'}
                          </button>

                          <button
                            type="button"
                            className={`btn-status ${
                              bStatus === 'interested' ? 'active-interested' : ''
                            }`}
                            onClick={() =>
                              handleBookmarkToggle(
                                t.id,
                                bStatus === 'interested' ? null : 'interested',
                                t.bookmark?.section || getDefaultSectionForTournament(t)
                              )
                            }
                          >
                            <Bookmark size={14} />
                            {bStatus === 'interested' ? 'Interested' : 'Interested'}
                          </button>
                        </div>

                        <div className="external-links-group">
                          {t.chessResultsTnr && (
                            <a
                              href={t.chessResultsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="ext-link"
                            >
                              Chess-Results ({t.registeredPlayersCount} players)
                              <ExternalLink size={12} />
                            </a>
                          )}
                          <a
                            href={t.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ext-link"
                          >
                            Official Info
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
        )}

        {/* TAB 2: INTERACTIVE MAP */}
        {activeTab === 'map' && (
          <section className="finder-split-layout" aria-label="Interactive Tournament Map">
            <div>
              <BelgiumMap
                tournaments={filteredTournaments}
                selectedTournamentId={selectedTournament?.id || null}
                onSelectTournament={(t) => setSelectedTournamentId(t.id)}
                playerProfile={playerProfile}
                maxDistanceKm={maxDistanceKm}
              />
            </div>

            <aside className="sticky-map-col">
              {selectedTournament && (
                <div className="selected-preview-card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.45rem',
                    }}
                  >
                    <span className="map-eyebrow">
                      SELECTED TOURNAMENT LOGISTICS
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.74rem',
                        color: 'var(--accent-forest)',
                        fontWeight: 700,
                      }}
                    >
                      Club Matricule #{selectedTournament.clubMatricule}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.08rem', marginBottom: '0.45rem' }}>
                    {selectedTournament.title}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.65rem',
                    }}
                  >
                    {selectedTournament.englishSummary}
                  </p>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <MapPin
                      size={13}
                      style={{ display: 'inline', marginRight: '4px' }}
                    />
                    <strong>Venue:</strong> {selectedTournament.venueAddress} ({selectedTournament.distanceKm} km • ~{selectedTournament.estimatedDriveMinutes} min drive)
                  </p>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.6rem',
                    }}
                  >
                    <Clock
                      size={13}
                      style={{ display: 'inline', marginRight: '4px' }}
                    />
                    <strong>Schedule:</strong> {selectedTournament.scheduleSummary}
                  </p>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      marginTop: '0.5rem',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <span>Verified Sources:</span>
                    {selectedTournament.sources.map((s) => (
                      <span
                        key={s}
                        style={{
                          background: 'var(--bg-subtle)',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn-status active-registered"
                      onClick={() => setActiveTab('finder')}
                    >
                      <Compass size={14} />
                      View in Tournament Finder
                    </button>
                    <a
                      href={selectedTournament.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ext-link"
                    >
                      Official Info
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </aside>
          </section>
        )}

        {/* TAB 3: TOURNAMENT SCHEDULE & ICAL SYNC */}
        {activeTab === 'schedule' && (
          <section aria-label="Personal Tournament Schedule">
            <div className="schedule-header-card">
              <div>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>
                  {playerProfile.fullName}’s Tournament Planner ({ageCategoryLabel} & Mixed Opens)
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Manage confirmed registrations, target sections, and personal logistics notes. Export directly to Google Calendar or Apple Calendar.
                </p>
              </div>
              <a
                id="btn-download-ical"
                href="/api/ical"
                download="belgian-chess-schedule.ics"
                className="btn-masthead btn-masthead-primary"
                style={{ textDecoration: 'none', padding: '0.65rem 1.1rem' }}
              >
                <Download size={16} />
                Export .ICS Calendar ({bookmarkedTournaments.length} events)
              </a>
            </div>

            {scheduleConflicts.length > 0 && (
              <div className="conflict-alert">
                {scheduleConflicts.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={16} />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="schedule-columns">
              {/* Confirmed Registrations */}
              <div className="schedule-col-box">
                <h3
                  style={{
                    fontSize: '1.05rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-forest)',
                  }}
                >
                  <CheckCircle2 size={18} />
                  Registered & Confirmed (
                  {
                    bookmarkedTournaments.filter(
                      (t) => t.bookmark?.status === 'registered'
                    ).length
                  }
                  )
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {bookmarkedTournaments
                    .filter((t) => t.bookmark?.status === 'registered')
                    .map((t) => (
                      <div
                        key={t.id}
                        style={{
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1rem',
                          background: 'var(--bg-canvas)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            color: 'var(--accent-forest)',
                            fontWeight: 700,
                            marginBottom: '0.35rem',
                          }}
                        >
                          <span>
                            {t.startDate === t.endDate
                              ? t.startDate
                              : `${t.startDate} → ${t.endDate}`}
                          </span>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <span>Section:</span>
                            <select
                              aria-label={`Select section for ${t.title}`}
                              value={t.bookmark?.section || getDefaultSectionForTournament(t)}
                              onChange={(e) =>
                                handleBookmarkToggle(
                                  t.id,
                                  'registered',
                                  e.target.value,
                                  t.bookmark?.notes
                                )
                              }
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-strong)',
                                background: '#ffffff',
                                fontWeight: 700,
                              }}
                            >
                              {Array.from(
                                new Set([
                                  ...t.ageGroups,
                                  t.bookmark?.section || ageCategoryLabel,
                                ])
                              ).map((sec) => (
                                <option key={sec} value={sec}>
                                  {sec}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>
                          {t.title}
                        </h4>
                        <p
                          style={{
                            fontSize: '0.82rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.45rem',
                          }}
                        >
                          {t.venueAddress} ({t.distanceKm} km • ~{t.estimatedDriveMinutes} min drive)
                        </p>
                        <p
                          style={{
                            fontSize: '0.8rem',
                            background: '#ffffff',
                            padding: '0.45rem 0.65rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-hairline)',
                            marginBottom: '0.55rem',
                          }}
                        >
                          <strong>Schedule:</strong> {t.scheduleSummary}
                        </p>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            marginBottom: '0.55rem',
                          }}
                        >
                          <input
                            type="text"
                            className="filter-input"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem' }}
                            placeholder="Add personal note (e.g., carpool, lunch, registration paid)..."
                            defaultValue={t.bookmark?.notes || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (t.bookmark?.notes || '')) {
                                handleBookmarkToggle(
                                  t.id,
                                  'registered',
                                  t.bookmark?.section,
                                  e.target.value
                                );
                              }
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn-status"
                            onClick={() =>
                              handleBookmarkToggle(
                                t.id,
                                'interested',
                                t.bookmark?.section,
                                t.bookmark?.notes
                              )
                            }
                          >
                            Move to Interested
                          </button>
                          <button
                            type="button"
                            className="btn-status"
                            onClick={() => handleBookmarkToggle(t.id, null)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Shortlisted / Interested */}
              <div className="schedule-col-box">
                <h3
                  style={{
                    fontSize: '1.05rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--accent-amber)',
                  }}
                >
                  <Bookmark size={18} />
                  Interested / Considering (
                  {
                    bookmarkedTournaments.filter(
                      (t) => t.bookmark?.status === 'interested'
                    ).length
                  }
                  )
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {bookmarkedTournaments
                    .filter((t) => t.bookmark?.status === 'interested')
                    .map((t) => (
                      <div
                        key={t.id}
                        style={{
                          border: '1px solid var(--border-hairline)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1rem',
                          background: 'var(--bg-canvas)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            color: 'var(--accent-amber)',
                            fontWeight: 700,
                            marginBottom: '0.35rem',
                          }}
                        >
                          <span>
                            {t.startDate === t.endDate
                              ? t.startDate
                              : `${t.startDate} to ${t.endDate}`}
                          </span>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <span>Target:</span>
                            <select
                              aria-label={`Select target section for ${t.title}`}
                              value={t.bookmark?.section || getDefaultSectionForTournament(t)}
                              onChange={(e) =>
                                handleBookmarkToggle(
                                  t.id,
                                  'interested',
                                  e.target.value,
                                  t.bookmark?.notes
                                )
                              }
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                border: '1px solid var(--border-strong)',
                                background: '#ffffff',
                                fontWeight: 700,
                              }}
                            >
                              {Array.from(
                                new Set([
                                  ...t.ageGroups,
                                  t.bookmark?.section || ageCategoryLabel,
                                ])
                              ).map((sec) => (
                                <option key={sec} value={sec}>
                                  {sec}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>
                          {t.title}
                        </h4>
                        <p
                          style={{
                            fontSize: '0.82rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.5rem',
                          }}
                        >
                          {t.city} • {t.distanceKm} km from {playerProfile.homeCity} • Entry: {t.entryFee}
                        </p>
                        <div style={{ marginBottom: '0.55rem' }}>
                          <input
                            type="text"
                            className="filter-input"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem' }}
                            placeholder="Add note (e.g., check hotel, ask coach)..."
                            defaultValue={t.bookmark?.notes || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (t.bookmark?.notes || '')) {
                                handleBookmarkToggle(
                                  t.id,
                                  'interested',
                                  t.bookmark?.section,
                                  e.target.value
                                );
                              }
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn-status active-registered"
                            onClick={() =>
                              handleBookmarkToggle(
                                t.id,
                                'registered',
                                t.bookmark?.section,
                                t.bookmark?.notes
                              )
                            }
                          >
                            Move to Registered
                          </button>
                          <button
                            type="button"
                            className="btn-status"
                            onClick={() => handleBookmarkToggle(t.id, null)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: PLAYER PROFILE & CHESS-RESULTS TRACKER */}
        {activeTab === 'player' && (
          <div className="player-grid-layout">
            <div className="profile-editor-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  marginBottom: '0.35rem',
                }}
              >
                <h2 style={{ fontSize: '1.2rem' }}>
                  Player & Home Base Settings
                </h2>
                <span className="badge badge-both">
                  {getBelgianAgeCategory(profileForm.birthYear).age} yo •{' '}
                  {getBelgianAgeCategory(profileForm.birthYear).ageCategory}
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.83rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                }}
              >
                Configure the player’s Belgian Matricule, FIDE ID, affiliated club, birth year, ratings, and home postal code to personalize distances and section eligibility.
              </p>

              <form
                onSubmit={handleSavePlayerProfile}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
              >
                <div className="filter-field">
                  <label className="filter-label" htmlFor="profile-fullname">
                    Player Full Name
                  </label>
                  <input
                    id="profile-fullname"
                    type="text"
                    className="filter-input"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, fullName: e.target.value })
                    }
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="profile-matricule">
                      Belgian Matricule (FRBE/VSF)
                    </label>
                    <input
                      id="profile-matricule"
                      type="text"
                      className="filter-input"
                      placeholder="e.g. 114892, 118204"
                      value={profileForm.belgianMatricule}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          belgianMatricule: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="profile-fideid">
                      FIDE ID
                    </label>
                    <input
                      id="profile-fideid"
                      type="text"
                      className="filter-input"
                      placeholder="e.g. 24981420"
                      value={profileForm.fideId}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, fideId: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* One-click FRBE / FIDE Rating Auto-Fill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    background: 'var(--bg-canvas)',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-hairline)',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Auto-fill ratings & club from FRBE-KBSB / FIDE ID:
                  </span>
                  <button
                    id="btn-lookup-federation"
                    type="button"
                    className="btn-status"
                    onClick={handleLookupFederationProfile}
                    disabled={isLookingUpFederation}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Sparkles size={13} />
                    {isLookingUpFederation ? 'Looking up...' : 'Lookup FRBE / FIDE'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1fr 1.2fr', gap: '0.6rem' }}>
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="profile-birthyear">
                      Birth Year
                    </label>
                    <input
                      id="profile-birthyear"
                      type="number"
                      min={1940}
                      max={2024}
                      className="filter-input"
                      value={profileForm.birthYear}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          birthYear: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="profile-postal">
                      Home Postal Code
                    </label>
                    <input
                      id="profile-postal"
                      type="text"
                      className="filter-input"
                      placeholder="e.g. 1000, 2800, 9000"
                      value={profileForm.homePostalCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const matchedLoc = BELGIAN_LOCATIONS[code.trim()];
                        setProfileForm({
                          ...profileForm,
                          homePostalCode: code,
                          homeCity: matchedLoc ? matchedLoc.city : profileForm.homeCity,
                        });
                      }}
                    />
                  </div>
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="profile-city">
                      Home City
                    </label>
                    <input
                      id="profile-city"
                      type="text"
                      className="filter-input"
                      placeholder="e.g. Brussels, Ghent"
                      value={profileForm.homeCity}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          homeCity: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.8fr', gap: '0.65rem' }}>
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="profile-club-mat">
                      Club Matricule
                    </label>
                    <input
                      id="profile-club-mat"
                      type="text"
                      className="filter-input"
                      placeholder="e.g. 201, 401"
                      value={profileForm.clubMatricule}
                      onChange={(e) => {
                        const cm = e.target.value;
                        const knownClub = BELGIAN_CLUBS_BY_MATRICULE[cm.trim()];
                        setProfileForm({
                          ...profileForm,
                          clubMatricule: cm,
                          clubName: knownClub ? knownClub.clubName : profileForm.clubName,
                        });
                      }}
                    />
                  </div>
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="profile-club-name">
                      Affiliated Belgian Chess Club
                    </label>
                    <input
                      id="profile-club-name"
                      type="text"
                      className="filter-input"
                      placeholder="e.g. CREB Bruxelles"
                      value={profileForm.clubName}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          clubName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="profile-elo-bel">
                      BEL ELO
                    </label>
                    <input
                      id="profile-elo-bel"
                      type="number"
                      min={0}
                      max={3000}
                      className="filter-input"
                      value={profileForm.belgianElo}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          belgianElo: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="profile-elo-rapid">
                      FIDE Rapid
                    </label>
                    <input
                      id="profile-elo-rapid"
                      type="number"
                      min={0}
                      max={3000}
                      className="filter-input"
                      value={profileForm.fideRapidElo}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          fideRapidElo: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="profile-elo-std">
                      FIDE Std
                    </label>
                    <input
                      id="profile-elo-std"
                      type="number"
                      min={0}
                      max={3000}
                      className="filter-input"
                      value={profileForm.fideStandardElo}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          fideStandardElo: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="filter-field">
                    <label className="filter-label" htmlFor="profile-elo-blitz">
                      FIDE Blitz
                    </label>
                    <input
                      id="profile-elo-blitz"
                      type="number"
                      min={0}
                      max={3000}
                      className="filter-input"
                      value={profileForm.fideBlitzElo}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          fideBlitzElo: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-masthead btn-masthead-primary"
                  style={{ justifyContent: 'center', padding: '0.65rem', marginTop: '0.4rem' }}
                >
                  <UserCheck size={16} />
                  Save Player Profile & Recalculate Distances
                </button>

                {profileSavedMsg && (
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--accent-forest)',
                      fontWeight: 600,
                    }}
                  >
                    {profileSavedMsg}
                  </p>
                )}
              </form>
            </div>

            {/* Right Column: Live Chess-Results Pairings & Performance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="pairings-card">
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.15rem' }}>
                      Chess-Results Live Tournament Tracker
                    </h3>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                      Enter any Belgian Chess-Results Tournament ID (`tnr`) or URL to pull round-by-round pairings, board numbers, and rating performance.
                    </p>
                  </div>
                  <form
                    onSubmit={handleImportChessResultsTnr}
                    style={{ display: 'flex', gap: '0.5rem' }}
                  >
                    <input
                      type="text"
                      className="filter-input"
                      style={{ width: '175px' }}
                      placeholder="tnr e.g. 1051904"
                      value={tnrLookupInput}
                      onChange={(e) => setTnrLookupInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="btn-status active-registered"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Sync tnr Pairings
                    </button>
                  </form>
                </div>

                {/* Quick-Select Bookmarked / Hub Tournament tnr Pills */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginTop: '0.75rem',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid var(--border-hairline)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.73rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    Quick select hub tnr:
                  </span>
                  {tournaments
                    .filter((t) => Boolean(t.chessResultsTnr))
                    .slice(0, 5)
                    .map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className="age-tag"
                        style={{
                          cursor: 'pointer',
                          border:
                            tnrLookupInput === t.chessResultsTnr
                              ? '1px solid var(--accent-forest)'
                              : '1px solid transparent',
                        }}
                        onClick={() => setTnrLookupInput(t.chessResultsTnr)}
                      >
                        tnr{t.chessResultsTnr} ({t.city})
                      </button>
                    ))}
                </div>
              </div>

              {playerEntries.map((entry) => (
                <div key={entry.id} className="pairings-card">
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div>
                      <span
                        className="badge badge-circuit"
                        style={{ marginRight: '0.5rem' }}
                      >
                        tnr{entry.chessResultsTnr}
                      </span>
                      <span className="badge badge-both">{entry.sectionName}</span>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {entry.date} • {entry.city}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.12rem', marginBottom: '0.6rem' }}>
                    {entry.tournamentTitle}
                  </h3>

                  <div className="card-specs-grid">
                    <div className="spec-cell">
                      <span className="spec-label">Score</span>
                      <span className="spec-value">
                        {entry.points} / {entry.completedRounds} ({entry.totalRounds}R)
                      </span>
                    </div>
                    <div className="spec-cell">
                      <span className="spec-label">Standing</span>
                      <span className="spec-value">
                        #{entry.currentRank} of {entry.totalPlayers} (Seed #{entry.startingRank})
                      </span>
                    </div>
                    <div className="spec-cell">
                      <span className="spec-label">Performance (TPR)</span>
                      <span className="spec-value">{entry.performanceRating} ELO</span>
                    </div>
                    <div className="spec-cell">
                      <span className="spec-label">Rating Gain</span>
                      <span
                        className="spec-value"
                        style={{ color: 'var(--accent-forest)' }}
                      >
                        +{entry.eloChange} ELO
                      </span>
                    </div>
                  </div>

                  <table className="pairings-table">
                    <thead>
                      <tr>
                        <th>Rd</th>
                        <th>Brd</th>
                        <th>Clr</th>
                        <th>Opponent</th>
                        <th>Opponent ELO</th>
                        <th>Club</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.pairings.map((p) => (
                        <tr key={p.round}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            R{p.round}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>#{p.board}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '3px',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.73rem',
                                fontWeight: 700,
                                background: p.color === 'W' ? '#f8fafc' : '#1e293b',
                                color: p.color === 'W' ? '#0f172a' : '#f8fafc',
                                border: '1px solid #94a3b8',
                              }}
                            >
                              {p.color === 'W' ? 'White' : 'Black'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.opponentName}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>
                            {p.opponentElo}
                          </td>
                          <td>{p.opponentClub}</td>
                          <td
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color:
                                p.pointsForPlayer === 1
                                  ? 'var(--accent-forest)'
                                  : p.pointsForPlayer === 0.5
                                  ? 'var(--accent-amber)'
                                  : 'var(--text-secondary)',
                            }}
                          >
                            {p.result}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BELGIAN DATA SOURCES & SYNC LOGS */}
        {activeTab === 'sources' && (
          <section className="pairings-card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>
                  Belgian Chess Federation Connectors & Deduplication Pipeline
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Live status of scrapers gathering youth & open tournaments across Belgium.
                </p>
              </div>
              <button
                type="button"
                className="btn-masthead btn-masthead-primary"
                onClick={handleRunLiveSync}
                disabled={isSyncing}
              >
                <RefreshCw size={15} />
                Run All Connectors Now
              </button>
            </div>

            <table className="pairings-table">
              <thead>
                <tr>
                  <th>Federation / Source</th>
                  <th>Status</th>
                  <th>Events Processed</th>
                  <th>New Events Merged</th>
                  <th>Completed At</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 700 }}>{log.source}</td>
                    <td>
                      <span className="badge badge-both">
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {log.itemsProcessed}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      +{log.newEventsAdded}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                      {log.completedAt.slice(0, 19).replace('T', ' ')}
                    </td>
                    <td>{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {/* Modal to Add a Tournament / Club Flyer */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>
              Add Belgian Chess Tournament or Club Flyer
            </h3>
            <p
              style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
              }}
            >
              Enter details from a local club flyer or Chess-Results page. It will automatically geocode the Belgian postal code and compute driving distance from {playerProfile.homeCity}.
            </p>
            <form
              onSubmit={handleCreateCustomTournament}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              <div className="filter-field">
                <label className="filter-label">Tournament Title</label>
                <input
                  type="text"
                  required
                  className="filter-input"
                  placeholder="e.g., Tournoi Jeunes & Rapid d'Ixelles"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="filter-field">
                  <label className="filter-label">Belgian Postal Code or City</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g., 1050, 2800, 9000"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                  />
                </div>
                <div className="filter-field">
                  <label className="filter-label">Start Date</label>
                  <input
                    type="date"
                    className="filter-input"
                    value={newStartDate}
                    onChange={(e) => {
                      setNewStartDate(e.target.value);
                      if (newEndDate < e.target.value) {
                        setNewEndDate(e.target.value);
                      }
                    }}
                  />
                </div>
                <div className="filter-field">
                  <label className="filter-label">End Date</label>
                  <input
                    type="date"
                    className="filter-input"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="filter-field">
                  <label className="filter-label">Category</label>
                  <select
                    className="filter-select"
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as 'youth' | 'both' | 'open')
                    }
                  >
                    <option value="youth">Youth Only</option>
                    <option value="both">Youth + Mixed Open</option>
                    <option value="open">Mixed Open</option>
                  </select>
                </div>
                <div className="filter-field">
                  <label className="filter-label">Time Control</label>
                  <select
                    className="filter-select"
                    value={newTimeControl}
                    onChange={(e) =>
                      setNewTimeControl(
                        e.target.value as 'rapid' | 'standard' | 'blitz'
                      )
                    }
                  >
                    <option value="rapid">Rapid</option>
                    <option value="standard">Classical</option>
                    <option value="blitz">Blitz</option>
                  </select>
                </div>
                <div className="filter-field">
                  <label className="filter-label">Rounds</label>
                  <input
                    type="number"
                    className="filter-input"
                    value={newRounds}
                    onChange={(e) => setNewRounds(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '0.75rem' }}>
                <div className="filter-field">
                  <label className="filter-label">Venue Address (Optional)</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g., Salle Communale, Place..."
                    value={newVenueAddress}
                    onChange={(e) => setNewVenueAddress(e.target.value)}
                  />
                </div>
                <div className="filter-field">
                  <label className="filter-label">Entry Fee</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g. €10"
                    value={newEntryFee}
                    onChange={(e) => setNewEntryFee(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="filter-field">
                  <label className="filter-label">Organizer Club (Optional)</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g. CREB Bruxelles"
                    value={newOrganizerClub}
                    onChange={(e) => setNewOrganizerClub(e.target.value)}
                  />
                </div>
                <div className="filter-field">
                  <label className="filter-label">
                    Chess-Results tnr ID (Optional)
                  </label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g. 1059912"
                    value={newTnr}
                    onChange={(e) => setNewTnr(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '0.75rem', alignItems: 'end' }}>
                <div className="filter-field">
                  <label className="filter-label">Official / Flyer URL (Optional)</label>
                  <input
                    type="url"
                    className="filter-input"
                    placeholder="https://..."
                    value={newOfficialUrl}
                    onChange={(e) => setNewOfficialUrl(e.target.value)}
                  />
                </div>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    paddingBottom: '0.55rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newIsFideRated}
                    onChange={(e) => setNewIsFideRated(e.target.checked)}
                  />
                  FIDE ELO Rated
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.6rem',
                  marginTop: '0.5rem',
                }}
              >
                <button
                  type="button"
                  className="btn-status"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-status active-registered"
                >
                  Add Tournament to Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
