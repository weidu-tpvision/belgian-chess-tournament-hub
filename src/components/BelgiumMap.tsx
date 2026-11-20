'use client';

import React, { useMemo, useState } from 'react';
import {
  MapPin,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Navigation,
} from 'lucide-react';
import { Tournament } from '@/db/schema';

interface BelgiumMapProps {
  tournaments: Tournament[];
  selectedTournamentId: string | null;
  onSelectTournament: (t: Tournament) => void;
}

// True-aspect geographic projection for Belgium onto 780 x 600 canvas
const MIN_LAT = 49.42;
const MAX_LAT = 51.58;
const MIN_LNG = 2.42;
const MAX_LNG = 6.52;
const MAP_W = 780;
const MAP_H = 600;
const PAD_X = 46;
const PAD_Y = 34;

function projectCoords(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * (MAP_W - PAD_X * 2) + PAD_X;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * (MAP_H - PAD_Y * 2) + PAD_Y;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

function coordsToPath(points: [number, number][], close = true): string {
  if (points.length === 0) return '';
  const projected = points.map(([lat, lng]) => projectCoords(lat, lng));
  const commands = projected.map((p, idx) =>
    idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  );
  return close ? `${commands.join(' ')} Z` : commands.join(' ');
}

// Accurate geographic boundary polygons (lat, lng)
const FLANDERS_COORDS: [number, number][] = [
  [51.09, 2.54], // De Panne
  [51.15, 2.72], // Nieuwpoort
  [51.23, 2.91], // Ostend
  [51.31, 3.13], // Blankenberge
  [51.36, 3.36], // Knokke-Heist
  [51.28, 3.55], // Maldegem
  [51.22, 3.81], // Zelzate
  [51.26, 4.05], // Stekene
  [51.35, 4.24], // Beveren / Scheldt
  [51.47, 4.46], // Essen
  [51.50, 4.77], // Hoogstraten
  [51.45, 5.05], // Ravels / Turnhout N
  [51.33, 5.26], // Lommel W
  [51.28, 5.50], // Hamont-Achel
  [51.15, 5.83], // Maaseik
  [50.96, 5.78], // Maasmechelen
  [50.85, 5.69], // Lanaken
  [50.76, 5.88], // Voeren E
  [50.76, 5.69], // Visé / Language border
  [50.74, 5.42], // Tongeren S
  [50.73, 5.10], // Landen
  [50.76, 4.90], // Hoegaarden
  [50.75, 4.58], // Overijse
  [50.74, 4.40], // Beersel
  [50.71, 4.24], // Halle
  [50.73, 3.98], // Geraardsbergen
  [50.74, 3.60], // Ronse
  [50.76, 3.24], // Kortrijk S
  [50.76, 2.95], // Mesen
  [50.78, 2.75], // Heuvelland
  [50.86, 2.58], // Poperinge W
];

const WALLONIA_COORDS: [number, number][] = [
  [50.76, 2.95], // Comines-Warneton
  [50.76, 3.24], // Mouscron
  [50.74, 3.60], // Ronse / Flobecq
  [50.73, 3.98], // Enghien
  [50.71, 4.24], // Tubize
  [50.74, 4.40], // Waterloo
  [50.75, 4.58], // Wavre
  [50.76, 4.90], // Jodoigne
  [50.73, 5.10], // Hannut
  [50.74, 5.42], // Waremme
  [50.76, 5.69], // Visé
  [50.76, 5.88], // Aubel / Voeren
  [50.75, 6.02], // Kelmis / Three-border
  [50.68, 6.13], // Eupen E
  [50.52, 6.26], // Monschau / High Fens
  [50.36, 6.40], // Losheimergraben
  [50.13, 6.14], // Burg-Reuland
  [50.00, 5.85], // Bastogne E
  [49.83, 5.75], // Martelange
  [49.55, 5.82], // Aubange / Arlon S
  [49.50, 5.47], // Torgny / Virton
  [49.68, 5.20], // Florenville
  [49.79, 5.05], // Bouillon
  [49.87, 4.86], // Bohan
  [50.14, 4.82], // Givet salient N
  [50.08, 4.68], // Givet salient W
  [49.98, 4.40], // Couvin
  [50.02, 4.16], // Chimay
  [50.30, 4.12], // Erquelinnes
  [50.36, 3.68], // Quiévrain
  [50.52, 3.35], // Tournai S
  [50.70, 3.22], // Mouscron S
];

const BRUSSELS_COORDS: [number, number][] = [
  [50.91, 4.36],
  [50.89, 4.44],
  [50.84, 4.47],
  [50.79, 4.42],
  [50.79, 4.33],
  [50.83, 4.27],
  [50.88, 4.29],
];

const LANGUAGE_BORDER_COORDS: [number, number][] = [
  [50.76, 2.95],
  [50.76, 3.24],
  [50.74, 3.60],
  [50.73, 3.98],
  [50.71, 4.24],
  [50.74, 4.40],
  [50.75, 4.58],
  [50.76, 4.90],
  [50.73, 5.10],
  [50.74, 5.42],
  [50.76, 5.69],
  [50.76, 5.88],
];

// Subtle major rivers for cartographic authenticity
const SCHELDT_RIVER: [number, number][] = [
  [50.61, 3.39],
  [50.84, 3.61],
  [51.05, 3.72],
  [51.03, 4.10],
  [51.15, 4.32],
  [51.22, 4.40],
  [51.35, 4.24],
];

const MEUSE_RIVER: [number, number][] = [
  [50.14, 4.82],
  [50.26, 4.91],
  [50.47, 4.87],
  [50.52, 5.23],
  [50.63, 5.58],
  [50.85, 5.69],
  [51.15, 5.83],
];

const NORTH_SEA_COORDS: [number, number][] = [
  [51.58, 2.42],
  [51.58, 3.65],
  [51.36, 3.36],
  [51.31, 3.13],
  [51.23, 2.91],
  [51.15, 2.72],
  [51.09, 2.54],
  [51.02, 2.42],
];

const REFERENCE_CITIES = [
  { name: 'Brussels', lat: 50.8466, lng: 4.3528, capital: true, dx: 0, dy: -11 },
  { name: 'Antwerp', lat: 51.2194, lng: 4.4025, capital: false, dx: -8, dy: -8 },
  { name: 'Ghent', lat: 51.0543, lng: 3.7174, capital: false, dx: 8, dy: 4 },
  { name: 'Bruges', lat: 51.2093, lng: 3.2247, capital: false, dx: 7, dy: -6 },
  { name: 'Leuven', lat: 50.8798, lng: 4.7005, capital: false, dx: 7, dy: 4 },
  { name: 'Hasselt', lat: 50.9307, lng: 5.3325, capital: false, dx: -7, dy: 12 },
  { name: 'Liège', lat: 50.6326, lng: 5.5797, capital: false, dx: 8, dy: 4 },
  { name: 'Namur', lat: 50.4674, lng: 4.872, capital: false, dx: 8, dy: 4 },
  { name: 'Charleroi', lat: 50.4108, lng: 4.4446, capital: false, dx: 8, dy: 10 },
  { name: 'Mons', lat: 50.4542, lng: 3.9567, capital: false, dx: -8, dy: 10 },
  { name: 'Arlon', lat: 49.6833, lng: 5.8167, capital: false, dx: -8, dy: -6 },
];

type FocusRegion = 'all' | 'flanders' | 'brussels' | 'wallonia';

const REGION_VIEWBOXES: Record<FocusRegion, [number, number, number, number]> = {
  all: [0, 0, MAP_W, MAP_H],
  flanders: [25, 10, 620, 320],
  brussels: [240, 115, 290, 215],
  wallonia: [155, 215, 595, 375],
};

function shortCityLabel(city: string): string {
  return city.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

export interface CityCluster {
  key: string;
  city: string;
  shortLabel: string;
  region: string;
  x: number;
  y: number;
  tournaments: Tournament[];
  hasSelected: boolean;
  hasBookmarked: boolean;
  primaryCategory: 'saved' | 'youth' | 'both' | 'open';
}

export default function BelgiumMap({
  tournaments,
  selectedTournamentId,
  onSelectTournament,
}: BelgiumMapProps) {
  const [focusRegion, setFocusRegion] = useState<FocusRegion>('all');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [hoveredClusterKey, setHoveredClusterKey] = useState<string | null>(null);

  // Precompute static paths once
  const paths = useMemo(
    () => ({
      northSea: coordsToPath(NORTH_SEA_COORDS, true),
      flanders: coordsToPath(FLANDERS_COORDS, true),
      wallonia: coordsToPath(WALLONIA_COORDS, true),
      brussels: coordsToPath(BRUSSELS_COORDS, true),
      languageBorder: coordsToPath(LANGUAGE_BORDER_COORDS, false),
      scheldt: coordsToPath(SCHELDT_RIVER, false),
      meuse: coordsToPath(MEUSE_RIVER, false),
    }),
    []
  );

  // Group tournaments by city coordinates so multiple events in the same city form one crisp cluster pin
  const cityClusters = useMemo<CityCluster[]>(() => {
    const map = new Map<string, Tournament[]>();
    for (const t of tournaments) {
      const key = `${t.city}::${t.lat.toFixed(2)},${t.lng.toFixed(2)}`;
      const existing = map.get(key);
      if (existing) {
        existing.push(t);
      } else {
        map.set(key, [t]);
      }
    }

    const clusters: CityCluster[] = [];
    for (const [key, list] of map.entries()) {
      const sorted = [...list].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const rep = sorted[0];
      const pt = projectCoords(rep.lat, rep.lng);
      const hasSelected = sorted.some((t) => t.id === selectedTournamentId);
      const hasBookmarked = sorted.some(
        (t) =>
          t.bookmark?.status === 'registered' ||
          t.bookmark?.status === 'interested'
      );

      let primaryCategory: 'saved' | 'youth' | 'both' | 'open' = 'both';
      if (hasBookmarked) primaryCategory = 'saved';
      else if (sorted.every((t) => t.category === 'youth')) primaryCategory = 'youth';
      else if (sorted.every((t) => t.category === 'open')) primaryCategory = 'open';

      clusters.push({
        key,
        city: rep.city,
        shortLabel: shortCityLabel(rep.city),
        region: rep.region,
        x: pt.x,
        y: pt.y,
        tournaments: sorted,
        hasSelected,
        hasBookmarked,
        primaryCategory,
      });
    }

    // Sort so selected cluster renders last (on top)
    clusters.sort((a, b) => {
      if (a.hasSelected && !b.hasSelected) return 1;
      if (!a.hasSelected && b.hasSelected) return -1;
      return b.tournaments.length - a.tournaments.length;
    });

    return clusters;
  }, [tournaments, selectedTournamentId]);

  // Compute smart non-colliding label offsets for each cluster
  const labelPositions = useMemo(() => {
    const result = new Map<string, { dx: number; dy: number; anchor: 'start' | 'end' | 'middle' }>();
    for (const c of cityClusters) {
      let leftCount = 0;
      let rightCount = 0;
      let aboveCount = 0;
      let belowCount = 0;

      for (const other of cityClusters) {
        if (other.key === c.key) continue;
        const dx = other.x - c.x;
        const dy = other.y - c.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 75) {
          if (dx > 0) rightCount++;
          else leftCount++;
          if (dy < 0) aboveCount++;
          else belowCount++;
        }
      }

      // Prefer side with fewer neighbors, or top/bottom if crowded horizontally
      if (rightCount === 0 && c.x < MAP_W - 110) {
        result.set(c.key, { dx: 14, dy: 4, anchor: 'start' });
      } else if (leftCount === 0 && c.x > 110) {
        result.set(c.key, { dx: -14, dy: 4, anchor: 'end' });
      } else if (aboveCount <= belowCount) {
        result.set(c.key, { dx: 0, dy: -16, anchor: 'middle' });
      } else {
        result.set(c.key, { dx: 0, dy: 21, anchor: 'middle' });
      }
    }
    return result;
  }, [cityClusters]);

  // Compute active viewBox from region preset + zoomScale
  const viewBoxStr = useMemo(() => {
    const [bx, by, bw, bh] = REGION_VIEWBOXES[focusRegion];
    const scaledW = bw / zoomScale;
    const scaledH = bh / zoomScale;
    const cx = bx + bw / 2;
    const cy = by + bh / 2;
    const vx = Math.max(0, Math.min(MAP_W - scaledW, cx - scaledW / 2));
    const vy = Math.max(0, Math.min(MAP_H - scaledH, cy - scaledH / 2));
    return `${vx.toFixed(1)} ${vy.toFixed(1)} ${scaledW.toFixed(1)} ${scaledH.toFixed(1)}`;
  }, [focusRegion, zoomScale]);

  const hoveredCluster = useMemo(
    () => cityClusters.find((c) => c.key === hoveredClusterKey) || null,
    [cityClusters, hoveredClusterKey]
  );

  const selectedCluster = useMemo(
    () => cityClusters.find((c) => c.hasSelected) || null,
    [cityClusters]
  );

  const activeFooterCluster = hoveredCluster || selectedCluster;

  function handleRegionFocus(region: FocusRegion) {
    setFocusRegion(region);
    setZoomScale(1);
  }

  function handlePinClick(cluster: CityCluster) {
    if (cluster.hasSelected && cluster.tournaments.length > 1) {
      // Cycle to next tournament in the same city when clicking an already-selected cluster
      const currentIdx = cluster.tournaments.findIndex(
        (t) => t.id === selectedTournamentId
      );
      const next = cluster.tournaments[(currentIdx + 1) % cluster.tournaments.length];
      onSelectTournament(next);
    } else {
      onSelectTournament(cluster.tournaments[0]);
    }
  }

  // Hide reference city dot if an active tournament cluster is right on top of it
  const visibleReferenceCities = useMemo(() => {
    return REFERENCE_CITIES.filter((ref) => {
      const rpt = projectCoords(ref.lat, ref.lng);
      return !cityClusters.some(
        (c) => Math.hypot(c.x - rpt.x, c.y - rpt.y) < 16
      );
    });
  }, [cityClusters]);

  return (
    <div className="belgium-map-shell" id="belgium-interactive-map">
      {/* Top Map Toolbar: Title + Region Focus + Zoom */}
      <div className="belgium-map-header">
        <div className="map-header-top-row">
          <div>
            <span className="map-eyebrow">INTERACTIVE CARTOGRAPHY • BELGIUM</span>
            <h3 className="map-title">
              Tournament Map{' '}
              <span className="map-count-subtitle">
                ({tournaments.length} {tournaments.length === 1 ? 'event' : 'events'} in{' '}
                {cityClusters.length} {cityClusters.length === 1 ? 'city' : 'cities'})
              </span>
            </h3>
          </div>

          <div className="map-controls-bar" aria-label="Map zoom and region focus">
            <div className="map-region-pills" role="group" aria-label="Region focus">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'flanders', label: 'Flanders' },
                  { id: 'brussels', label: 'Brussels' },
                  { id: 'wallonia', label: 'Wallonia' },
                ] as { id: FocusRegion; label: string }[]
              ).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`map-ctrl-pill ${focusRegion === r.id ? 'active' : ''}`}
                  onClick={() => handleRegionFocus(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="map-zoom-group" role="group" aria-label="Zoom controls">
              <button
                type="button"
                className="map-icon-btn"
                title="Zoom in"
                aria-label="Zoom in"
                onClick={() => setZoomScale((z) => Math.min(2.2, +(z + 0.3).toFixed(2)))}
                disabled={zoomScale >= 2.2}
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                className="map-icon-btn"
                title="Zoom out"
                aria-label="Zoom out"
                onClick={() => setZoomScale((z) => Math.max(1, +(z - 0.3).toFixed(2)))}
                disabled={zoomScale <= 1}
              >
                <ZoomOut size={14} />
              </button>
              {(focusRegion !== 'all' || zoomScale > 1) && (
                <button
                  type="button"
                  className="map-icon-btn"
                  title="Reset view"
                  aria-label="Reset map view"
                  onClick={() => {
                    setFocusRegion('all');
                    setZoomScale(1);
                  }}
                >
                  <Maximize2 size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="map-legend">
          <span className="legend-item">
            <span className="legend-dot dot-youth" /> Youth
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-both" /> Youth + Open
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-open" /> Mixed Open
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-saved" /> Saved / Registered
          </span>
        </div>
      </div>

      {/* Clean Cartographic SVG Canvas — Zero floating overlays obscuring cities */}
      <div className="belgium-svg-wrapper">
        <svg
          viewBox={viewBoxStr}
          className="belgium-svg"
          role="img"
          aria-label="Interactive map of chess tournaments across Belgium"
        >
          <defs>
            <linearGradient id="seaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d7e7f2" />
              <stop offset="100%" stopColor="#e7f0f6" />
            </linearGradient>
            <linearGradient id="flandersGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#faf6ec" />
              <stop offset="100%" stopColor="#f2ebd9" />
            </linearGradient>
            <linearGradient id="walloniaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#efe6d5" />
              <stop offset="100%" stopColor="#e5d9c3" />
            </linearGradient>
            <filter id="countryElevation" x="-8%" y="-8%" width="116%" height="116%">
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="5"
                floodColor="#1e293b"
                floodOpacity="0.14"
              />
            </filter>
            <filter id="pinShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="2.2"
                floodColor="#0f172a"
                floodOpacity="0.28"
              />
            </filter>
          </defs>

          {/* Subtle surrounding landmass canvas */}
          <rect x="0" y="0" width={MAP_W} height={MAP_H} className="map-backdrop-land" />

          {/* North Sea coastline shading in NW */}
          <path d={paths.northSea} fill="url(#seaGradient)" className="map-north-sea" />
          <text x="64" y="54" className="sea-watermark">
            NORTH SEA
          </text>

          {/* Neighbor country subtle labels */}
          <text x="455" y="42" className="neighbor-label">
            NETHERLANDS
          </text>
          <text x="115" y="425" className="neighbor-label">
            FRANCE
          </text>
          <text x="708" y="348" className="neighbor-label" textAnchor="end">
            GERMANY
          </text>
          <text x="678" y="505" className="neighbor-label" textAnchor="end">
            LUXEMBOURG
          </text>

          {/* Belgium Silhouette with elevation */}
          <g filter="url(#countryElevation)">
            <path d={paths.flanders} fill="url(#flandersGrad)" className="region-flanders" />
            <path d={paths.wallonia} fill="url(#walloniaGrad)" className="region-wallonia" />
          </g>

          {/* Subtle Rivers (Scheldt & Meuse) */}
          <path d={paths.scheldt} className="map-river" />
          <path d={paths.meuse} className="map-river" />

          {/* Regional Language Border */}
          <path d={paths.languageBorder} className="region-border-line" />

          {/* Brussels-Capital Region Enclave */}
          <path d={paths.brussels} className="region-brussels" />

          {/* Subtle Region Watermarks */}
          <text x="275" y="138" className="region-watermark">
            FLANDERS
          </text>
          <text x="455" y="395" className="region-watermark">
            WALLONIA
          </text>

          {/* Reference cities (only shown when not covered by an active tournament cluster) */}
          {visibleReferenceCities.map((c) => {
            const pt = projectCoords(c.lat, c.lng);
            return (
              <g
                key={c.name}
                transform={`translate(${pt.x}, ${pt.y})`}
                className="city-ref-group"
              >
                <circle
                  r={c.capital ? 3.5 : 2.3}
                  className={c.capital ? 'city-ref-capital' : 'city-ref-dot'}
                />
                <text
                  x={c.dx}
                  y={c.dy}
                  textAnchor={c.dx < 0 ? 'end' : c.dx > 0 ? 'start' : 'middle'}
                  className={c.capital ? 'city-ref-label-capital' : 'city-ref-label'}
                >
                  {c.name}
                </text>
              </g>
            );
          })}

          {/* Interactive Tournament City Clusters */}
          {cityClusters.map((cluster) => {
            const isSelected = cluster.hasSelected;
            const isHovered = hoveredClusterKey === cluster.key;
            const count = cluster.tournaments.length;
            const labelPos = labelPositions.get(cluster.key) || {
              dx: 14,
              dy: 4,
              anchor: 'start',
            };

            const pinClass =
              cluster.primaryCategory === 'saved'
                ? 'pin-saved'
                : cluster.primaryCategory === 'youth'
                ? 'pin-youth'
                : cluster.primaryCategory === 'open'
                ? 'pin-open'
                : 'pin-both';

            const baseRadius = count > 1 ? 11.5 : 9;
            const activeRadius = isSelected ? baseRadius + 2 : isHovered ? baseRadius + 1 : baseRadius;

            return (
              <g
                key={cluster.key}
                transform={`translate(${cluster.x}, ${cluster.y})`}
                className={`map-pin-group ${isSelected ? 'is-selected' : ''} ${
                  isHovered ? 'is-hovered' : ''
                }`}
                onClick={() => handlePinClick(cluster)}
                onMouseEnter={() => setHoveredClusterKey(cluster.key)}
                onMouseLeave={() => setHoveredClusterKey(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePinClick(cluster);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`${cluster.city}: ${count} ${
                  count === 1 ? 'tournament' : 'tournaments'
                }`}
              >
                {/* Crisp selection pulse ring — compact, never obscures neighbor cities */}
                {isSelected && (
                  <>
                    <circle r={activeRadius + 8} className="pin-selected-pulse" />
                    <circle r={activeRadius + 4} className="pin-selected-halo" />
                  </>
                )}

                {/* Invisible larger hit target for effortless clicking */}
                <circle r={17} fill="transparent" />

                {/* Main Pin Circle */}
                <circle
                  r={activeRadius}
                  className={`map-pin-circle ${pinClass}`}
                  filter="url(#pinShadow)"
                />

                {/* Inner Marker: Count if >1, else crisp center dot */}
                {count > 1 ? (
                  <text
                    x="0"
                    y="3.8"
                    textAnchor="middle"
                    className="map-pin-count-text"
                  >
                    {count}
                  </text>
                ) : (
                  <circle r="2.8" fill="#ffffff" style={{ pointerEvents: 'none' }} />
                )}

                {/* Crisp City Name Label with white halo for readability, positioned to avoid collisions */}
                <text
                  x={labelPos.dx}
                  y={labelPos.dy}
                  textAnchor={labelPos.anchor}
                  className={`map-city-label ${isSelected ? 'is-selected' : ''} ${
                    isHovered ? 'is-hovered' : ''
                  }`}
                >
                  {cluster.shortLabel}
                </text>

                <title>
                  {`${cluster.city} (${count} ${count === 1 ? 'event' : 'events'}): ${cluster.tournaments
                    .map((t) => `${t.title} [${t.startDate}]`)
                    .join(' • ')}`}
                </title>
              </g>
            );
          })}

          {/* Subtle Cartographic Scale Bar & Compass (bottom-left corner, away from all cities) */}
          <g transform="translate(26, 558)" className="map-scale-bar" aria-hidden="true">
            <line x1="0" y1="0" x2="72" y2="0" stroke="rgba(30, 41, 59, 0.45)" strokeWidth="1.5" />
            <line x1="0" y1="-4" x2="0" y2="2" stroke="rgba(30, 41, 59, 0.45)" strokeWidth="1.5" />
            <line x1="72" y1="-4" x2="72" y2="2" stroke="rgba(30, 41, 59, 0.45)" strokeWidth="1.5" />
            <text x="36" y="-6" textAnchor="middle" className="map-scale-text">
              ~40 km
            </text>
          </g>
        </svg>
      </div>

      {/* Docked Non-Obstructive Status Bar (replaces the old floating overlay) */}
      <div className="map-docked-status" aria-live="polite">
        {activeFooterCluster ? (
          <>
            <span className="map-status-indicator">
              <Navigation size={13} />
              <strong>{hoveredCluster ? 'Previewing' : 'Selected'}:</strong>{' '}
              {activeFooterCluster.city} ({activeFooterCluster.region})
            </span>
            <span className="map-status-meta">
              {activeFooterCluster.tournaments.length === 1
                ? `${activeFooterCluster.tournaments[0].title} • ${activeFooterCluster.tournaments[0].startDate}`
                : `${activeFooterCluster.tournaments.length} tournaments in this city — click pin or choose in panel`}
            </span>
          </>
        ) : (
          <span className="map-status-indicator">
            <MapPin size={13} />
            Click any city marker on the map to inspect its tournaments.
          </span>
        )}
      </div>

      {/* Quick City Selector Chips below map for 1-click access without hunting */}
      {cityClusters.length > 0 && (
        <div className="map-city-chips-bar" aria-label="Quick city selector">
          <span className="map-city-chips-label">Cities:</span>
          <div className="map-city-chips-list">
            {cityClusters.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`map-city-chip ${c.hasSelected ? 'active' : ''}`}
                onClick={() => handlePinClick(c)}
                onMouseEnter={() => setHoveredClusterKey(c.key)}
                onMouseLeave={() => setHoveredClusterKey(null)}
              >
                <span className={`chip-color-dot dot-${c.primaryCategory}`} />
                <span>{c.shortLabel}</span>
                {c.tournaments.length > 1 && (
                  <span className="chip-count-badge">{c.tournaments.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
