'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
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

type ActiveTab = 'finder' | 'schedule' | 'player' | 'sources';

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

  // Selected tournament for Map / Details
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(
    INITIAL_TOURNAMENTS[0]?.id || null
  );

  // Add Custom Tournament Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCity, setNewCity] = useState('1000');
  const [newStartDate, setNewStartDate] = useState('2027-01-31');
  const [newCategory, setNewCategory] = useState<'youth' | 'both' | 'open'>('both');
  const [newTimeControl, setNewTimeControl] = useState<'rapid' | 'standard' | 'blitz'>('rapid');
  const [newRounds, setNewRounds] = useState(7);
  const [newTnr, setNewTnr] = useState('');

  // Player Profile Form State
  const [profileForm, setProfileForm] = useState<PlayerProfile>(
    INITIAL_PLAYER_PROFILE
  );
  const [tnrLookupInput, setTnrLookupInput] = useState('1048291');
  const [profileSavedMsg, setProfileSavedMsg] = useState<string | null>(null);

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
        const hasU10 = t.ageGroups.some((g) =>
          /u10|u12|jeugd|youth|open/i.test(g)
        );
        if (!hasU10) return false;
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

  async function handleBookmarkToggle(
    tournamentId: string,
    status: BookmarkStatus | null,
    section = 'U10'
  ) {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, status, section }),
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
        endDate: newStartDate,
        category: newCategory,
        timeControl: newTimeControl,
        rounds: newRounds,
        chessResultsTnr: newTnr,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setTournaments(data.tournaments);
      setSelectedTournamentId(data.tournament.id);
      setShowAddModal(false);
      setNewTitle('');
      setNewTnr('');
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
      setTournaments(data.tournaments);
      setProfileSavedMsg(
        `Saved profile & recalculated driving distances from ${data.profile.homeCity} (${data.profile.homePostalCode}).`
      );
      setTimeout(() => setProfileSavedMsg(null), 4500);
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

  const playerAge = 2026 - playerProfile.birthYear;
  const ageCategoryLabel =
    playerAge <= 8
      ? 'U8'
      : playerAge <= 10
      ? 'U10'
      : playerAge <= 12
      ? 'U12'
      : 'U14';

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
                Matricule #{playerProfile.belgianMatricule} • FIDE #{playerProfile.fideId} • Base: {playerProfile.homeCity}
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
              Tournament Finder & Map
              <span className="tab-count-pill">{filteredTournaments.length}</span>
            </button>
            <button
              id="tab-schedule"
              type="button"
              className={`nav-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <Calendar size={16} />
              My Son’s Schedule & iCal
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

        {/* TAB 1: TOURNAMENT FINDER & INTERACTIVE MAP */}
        {activeTab === 'finder' && (
          <>
            <section className="filter-panel" aria-label="Tournament Filters">
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
                    All Suitable for 9yo ({tournaments.length})
                  </button>
                  <button
                    type="button"
                    className={`toggle-chip ${categoryFilter === 'youth' ? 'active' : ''}`}
                    onClick={() => setCategoryFilter('youth')}
                  >
                    Youth Categories (U8 / U10 / U12)
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
                  Highlight {ageCategoryLabel} Eligibility
                </label>
              </div>
            </section>

            {/* Split List + Map */}
            <div className="finder-split-layout">
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
                              ag.includes('U10') || ag.includes('<1600') || ag.includes('<1500')
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
                                t.ageGroups.includes('U10') ? 'U10' : t.ageGroups[0]
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
                                t.ageGroups.includes('U10') ? 'U10' : t.ageGroups[0]
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

              {/* Sticky Map & Selected Venue Inspector */}
              <aside className="sticky-map-col">
                <BelgiumMap
                  tournaments={filteredTournaments}
                  selectedTournamentId={selectedTournament?.id || null}
                  onSelectTournament={(t) => setSelectedTournamentId(t.id)}
                  playerProfile={playerProfile}
                  maxDistanceKm={maxDistanceKm}
                />

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
                    <h4 style={{ fontSize: '1.02rem', marginBottom: '0.4rem' }}>
                      {selectedTournament.title}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.6rem',
                      }}
                    >
                      <MapPin
                        size={13}
                        style={{ display: 'inline', marginRight: '4px' }}
                      />
                      <strong>Venue:</strong> {selectedTournament.venueAddress}
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
                  </div>
                )}
              </aside>
            </div>
          </>
        )}

        {/* TAB 2: MY SON'S SCHEDULE & ICAL SYNC */}
        {activeTab === 'schedule' && (
          <section aria-label="Personal Tournament Schedule">
            <div className="schedule-header-card">
              <div>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>
                  {playerProfile.fullName}’s Tournament Planner ({ageCategoryLabel} & Mixed Opens)
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Manage confirmed registrations and shortlisted weekend tournaments. Export directly to Google Calendar or Apple Calendar.
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
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            color: 'var(--accent-forest)',
                            fontWeight: 700,
                            marginBottom: '0.3rem',
                          }}
                        >
                          <span>{t.startDate}</span>
                          <span>Section: {t.bookmark?.section || 'U10'}</span>
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
                          }}
                        >
                          <strong>Schedule:</strong> {t.scheduleSummary}
                          {t.bookmark?.notes ? ` — Note: ${t.bookmark.notes}` : ''}
                        </p>
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
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            color: 'var(--accent-amber)',
                            fontWeight: 700,
                            marginBottom: '0.3rem',
                          }}
                        >
                          <span>
                            {t.startDate === t.endDate
                              ? t.startDate
                              : `${t.startDate} to ${t.endDate}`}
                          </span>
                          <span>Target: {t.bookmark?.section || 'U10'}</span>
                        </div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>
                          {t.title}
                        </h4>
                        <p
                          style={{
                            fontSize: '0.82rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.6rem',
                          }}
                        >
                          {t.city} • {t.distanceKm} km from {playerProfile.homeCity} • Entry: {t.entryFee}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn-status active-registered"
                            onClick={() =>
                              handleBookmarkToggle(t.id, 'registered', t.bookmark?.section)
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
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>
                Player & Home Base Settings
              </h2>
              <p
                style={{
                  fontSize: '0.83rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                }}
              >
                Configure your son’s Belgian Matricule, FIDE ID, birth year, and home postal code to personalize distances and U10/Youth eligibility.
              </p>

              <form
                onSubmit={handleSavePlayerProfile}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
              >
                <div className="filter-field">
                  <label className="filter-label">Player Full Name</label>
                  <input
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
                    <label className="filter-label">Birth Year</label>
                    <input
                      type="number"
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
                    <label className="filter-label">Home Postal Code</label>
                    <input
                      type="text"
                      className="filter-input"
                      placeholder="e.g. 1000, 2000, 3000, 5000, 9000"
                      value={profileForm.homePostalCode}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          homePostalCode: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="filter-field">
                    <label className="filter-label">Belgian Matricule (FRBE/VSF)</label>
                    <input
                      type="text"
                      className="filter-input"
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
                    <label className="filter-label">FIDE ID</label>
                    <input
                      type="text"
                      className="filter-input"
                      value={profileForm.fideId}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, fideId: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <div className="filter-field">
                    <label className="filter-label">Belgian ELO</label>
                    <input
                      type="number"
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
                    <label className="filter-label">FIDE Rapid</label>
                    <input
                      type="number"
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
                    <label className="filter-label">FIDE Std</label>
                    <input
                      type="number"
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
                      Enter any Belgian Chess-Results Tournament ID (`tnr`) to pull round-by-round pairings, board numbers, and rating performance.
                    </p>
                  </div>
                  <form
                    onSubmit={handleImportChessResultsTnr}
                    style={{ display: 'flex', gap: '0.5rem' }}
                  >
                    <input
                      type="text"
                      className="filter-input"
                      style={{ width: '160px' }}
                      placeholder="tnr e.g. 1048291"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="filter-field">
                  <label className="filter-label">Belgian Postal Code or City</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g., 1050, 2000, 3000, 5000, 9000"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                  />
                </div>
                <div className="filter-field">
                  <label className="filter-label">Date</label>
                  <input
                    type="date"
                    className="filter-input"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
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
