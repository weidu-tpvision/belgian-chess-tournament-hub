# Belgian Chess Tournament Hub

A responsive full-stack TypeScript web application (Next.js App Router) for discovering, filtering, mapping, and planning **Youth** (`U8`, `U10`, `U12`, `U14`, `U16`, `U18`, `U20`, **Circuit JEF**, **Vlaams Jeugdschaakcriterium**, **Belgian Youth Championship**) and **Mixed Open** chess tournaments across Belgium.

## Features

- **Tournament Finder & Collapsible Filter Bar**:
  - Compact criteria summary bar shown by default; click **Modify Search & Filters** to expand search and filter controls.
  - Filter by keyword (city, club, or tournament), **Circuit / Series** (`JEF`, `VSF_YOUTH`, `NATIONAL`, `OPEN`), **Time Control** (`Standard`, `Rapid`, `Blitz`), **Region** (`Brussels`, `Flanders`, `Wallonia`), and **Category** (`All Categories`, `Youth`, `Combined Youth + Mixed Open`, `Mixed Open`).
  - Jump directly from any tournament card to its pin on the map via **View on Map**, or add custom events via **Add Flyer / Event** with automatic Belgian postal-code geocoding (`1000`–`9999`).
- **Interactive Map of Belgium**:
  - Dedicated **Interactive Map** tab displaying the map above the **Selected Tournament Logistics** card.
  - Defaults to the next upcoming tournament and renders a floating callout label (title, city, and start date) over the selected pin.
  - Includes full tournament specs (Date, City & Region, Format & Entry, Schedule, Sections), external links, and **Mark Registered** / **Interested** actions directly inside the map preview card.
  - Color-coded pins for Youth, Youth + Mixed Open, Mixed Open, and Registered/Saved tournaments across Flanders, Brussels, and Wallonia.
- **Schedule & `.ics` Calendar Feed**:
  - Instant optimistic **Registered** / **Interested** bookmarking, playing section selection, logistics notes, weekend date-overlap detection, and `.ics` calendar export (`Belgian Chess Tournament Schedule`) for Google Calendar or Apple Calendar.
- **Multi-Source Belgian Calendar Aggregation**:
  - **FRBE-KBSB-KSB** (`frbe-kbsb-ksb.be`) — National calendar & club directory
  - **VSF** (`vlaamseschaakfederatie.be`) — Flemish calendar & *Vlaams Jeugdschaakcriterium*
  - **FEFB** (`fefb.be`) — Francophone calendar & *Circuit JEF (Jeunes Échecs Francophones)*
  - **SVDB** — East Belgium tournaments
  - **Chess-Results (`fed=BEL`)** — Tournament `tnr` discovery and player counts
- **Serverless & Local Persistence**:
  - Persists to `data/chess-hub-db.json` locally and automatically falls back to `/tmp/chess-hub-db.json` (plus in-memory state) on read-only serverless filesystems such as Vercel.

## API Endpoints

- `GET /api/tournaments` & `POST /api/tournaments` — List tournaments or add a custom club flyer/tournament with postal-code geocoding.
- `POST /api/bookmarks` — Upsert or remove tournament bookmarks (`registered` / `interested`), target sections, and notes.
- `GET /api/sync` & `POST /api/sync` — View deduplication sync logs and run federation calendar connectors.
- `GET /api/ical` — Export `registered` and `interested` tournaments as a standard `.ics` calendar feed.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

