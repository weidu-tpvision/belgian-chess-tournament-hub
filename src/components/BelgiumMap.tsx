'use client';

import React from 'react';
import { Tournament } from '@/db/schema';

interface BelgiumMapProps {
  tournaments: Tournament[];
  selectedTournamentId: string | null;
  onSelectTournament: (t: Tournament) => void;
}

// Bounding box for Belgium projection onto 800 x 560 canvas
const MIN_LAT = 49.45;
const MAX_LAT = 51.55;
const MIN_LNG = 2.48;
const MAX_LNG = 6.45;
const MAP_W = 800;
const MAP_H = 560;

function projectCoords(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * (MAP_W - 90) + 45;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * (MAP_H - 80) + 40;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

export default function BelgiumMap({
  tournaments,
  selectedTournamentId,
  onSelectTournament,
}: BelgiumMapProps) {

  return (
    <div className="belgium-map-shell" id="belgium-interactive-map">
      <div className="belgium-map-header">
        <div>
          <span className="map-eyebrow">GEOGRAPHIC DISTRIBUTION • BELGIUM</span>
          <h3 className="map-title">
            Interactive Tournament Map ({tournaments.length} events shown)
          </h3>
        </div>
        <div className="map-legend">
          <span className="legend-item">
            <span className="legend-dot dot-youth" /> Youth (JEF / Criterium / U10)
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-both" /> Youth + Mixed Open
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-open" /> Mixed Open
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-saved" /> Registered / Saved
          </span>
        </div>
      </div>

      <div className="belgium-svg-wrapper">
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="belgium-svg"
          role="img"
          aria-label="Interactive map of chess tournaments across Belgium"
        >
          <defs>
            <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* Stylized Flanders (North) & Wallonia (South) & Brussels regional polygons */}
          {/* Flanders Polygon */}
          <path
            d="M 55 128 L 135 90 L 235 102 L 350 75 L 430 62 L 525 84 L 605 115 L 615 195 L 535 220 L 420 218 L 320 225 L 205 220 L 95 198 Z"
            className="region-flanders"
          />
          {/* Wallonia Polygon */}
          <path
            d="M 95 198 L 205 220 L 320 225 L 420 218 L 535 220 L 615 195 L 718 228 L 705 315 L 635 415 L 595 505 L 515 485 L 435 410 L 348 355 L 250 325 L 155 268 Z"
            className="region-wallonia"
          />
          {/* Language / Regional Border Line */}
          <path
            d="M 95 198 L 205 220 L 320 225 L 420 218 L 535 220 L 615 195"
            className="region-border-line"
          />

          {/* Region Watermark Labels */}
          <text x="275" y="148" className="region-watermark">
            FLANDERS (VSF)
          </text>
          <text x="435" y="325" className="region-watermark">
            WALLONIA (FEFB / SVDB)
          </text>

          {/* Reference city labels */}
          {[
            { name: 'Brussels', lat: 50.8466, lng: 4.3528 },
            { name: 'Bruges', lat: 51.2093, lng: 3.2247 },
            { name: 'Ghent', lat: 51.0543, lng: 3.7174 },
            { name: 'Antwerp', lat: 51.2194, lng: 4.4025 },
            { name: 'Hasselt', lat: 50.9307, lng: 5.3325 },
            { name: 'Liège', lat: 50.6326, lng: 5.5797 },
            { name: 'Namur', lat: 50.4674, lng: 4.872 },
            { name: 'Charleroi', lat: 50.4108, lng: 4.4446 },
            { name: 'Mons', lat: 50.4542, lng: 3.9567 },
            { name: 'Eupen', lat: 50.6279, lng: 6.0365 },
          ].map((c) => {
            const pt = projectCoords(c.lat, c.lng);
            return (
              <g key={c.name} transform={`translate(${pt.x}, ${pt.y})`}>
                <circle r="2.5" className="city-ref-dot" />
                <text x="6" y="3" className="city-ref-label">
                  {c.name}
                </text>
              </g>
            );
          })}

          {/* Tournament Pins */}
          {(() => {
            let selectedCallout: {
              cx: number;
              cy: number;
              title: string;
              meta: string;
            } | null = null;

            const pinElements = tournaments.map((t, index) => {
              const pt = projectCoords(t.lat, t.lng);
              // Slight deterministic offset if multiple events in same city
              const offsetAngle = (index % 5) * 1.25;
              const offsetX = Math.round(Math.cos(offsetAngle) * 4);
              const offsetY = Math.round(Math.sin(offsetAngle) * 4);
              const cx = pt.x + offsetX;
              const cy = pt.y + offsetY;

              const isSelected = selectedTournamentId === t.id;
              if (isSelected) {
                const shortTitle =
                  t.title.length > 42 ? `${t.title.slice(0, 41)}…` : t.title;
                selectedCallout = {
                  cx,
                  cy,
                  title: shortTitle,
                  meta: `${t.city} • ${t.startDate}`,
                };
              }

              const isBookmarked =
                t.bookmark?.status === 'registered' ||
                t.bookmark?.status === 'interested';

              let pinClass = 'pin-both';
              if (isBookmarked) pinClass = 'pin-saved';
              else if (t.category === 'youth') pinClass = 'pin-youth';
              else if (t.category === 'open') pinClass = 'pin-open';

              return (
                <g
                  key={t.id}
                  transform={`translate(${cx}, ${cy})`}
                  className={`map-pin-group ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => onSelectTournament(t)}
                  style={{ cursor: 'pointer' }}
                >
                  {isSelected && <circle r="16" className="pin-selected-halo" />}
                  <circle
                    r={isSelected ? 10 : 8}
                    className={`map-pin-circle ${pinClass}`}
                    filter="url(#pinShadow)"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    className="map-pin-inner-text"
                  >
                    {t.category === 'youth' ? 'Y' : t.category === 'both' ? 'Y+' : 'O'}
                  </text>
                  <title>
                    {`${t.title} (${t.city}) — ${t.startDate}`}
                  </title>
                </g>
              );
            });

            if (!selectedCallout) return pinElements;

            const callout = selectedCallout as {
              cx: number;
              cy: number;
              title: string;
              meta: string;
            };
            const boxW = Math.max(170, Math.min(310, callout.title.length * 6.4 + 28));
            const boxH = 40;
            const rawX = callout.cx - boxW / 2;
            const boxX = Math.max(12, Math.min(MAP_W - boxW - 12, rawX));
            const showBelow = callout.cy < 72;
            const boxY = showBelow ? callout.cy + 18 : callout.cy - boxH - 18;

            return (
              <>
                {pinElements}
                <g
                  className="map-floating-callout"
                  style={{ pointerEvents: 'none' }}
                  filter="url(#pinShadow)"
                >
                  <rect
                    x={boxX}
                    y={boxY}
                    width={boxW}
                    height={boxH}
                    rx={6}
                    ry={6}
                    fill="#fffdf8"
                    stroke="#1b4332"
                    strokeWidth={1.5}
                  />
                  <text
                    x={boxX + boxW / 2}
                    y={boxY + 16}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="700"
                    fill="#161917"
                  >
                    {callout.title}
                  </text>
                  <text
                    x={boxX + boxW / 2}
                    y={boxY + 30}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="600"
                    fill="#1b4332"
                  >
                    {callout.meta}
                  </text>
                </g>
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
