# Belgian Chess Tournament Hub

A responsive full-stack TypeScript web application (Next.js App Router) for discovering, filtering, mapping, and planning **Youth** (`U8`, `U10`, `U12`, `U14`, `U16`, `U18`, `U20`, **Circuit JEF**, **Vlaams Jeugdschaakcriterium**, **Belgian Youth Championship**) and **Mixed Open** chess tournaments across Belgium.

## Features

- **Tournament Finder & Collapsible Filter Bar**:
  - Compact criteria summary bar shown by default; click **Modify Search & Filters** to expand search and filter controls.
  - Filter by keyword (city, club, or tournament), **Circuit / Series** (`JEF`, `VSF_YOUTH`, `NATIONAL`, `OPEN`), **Time Control** (`Standard`, `Rapid`, `Blitz`), **Region** (`Brussels`, `Flanders`, `Wallonia`), and **Category** (`All Categories`, `Youth`, `Combined Youth + Mixed Open`, `Mixed Open`).
  - Add local club flyers or custom events via **Add Flyer / Event** with automatic Belgian postal-code geocoding (`1000`–`9999`).
- **Interactive Map of Belgium**:
  - Dedicated **Interactive Map** tab displaying the map above the **Selected Tournament Logistics** card.
  - Defaults to the next upcoming tournament and renders a floating callout label (title, city, and start date) over the selected pin.
  - Color-coded pins for Youth, Youth + Mixed Open, Mixed Open, and Registered/Saved tournaments across Flanders, Brussels, and Wallonia.
- **Schedule & `.ics` Calendar Feed**:
  - Mark tournaments as **Registered** or **Interested**, choose playing sections, save logistics notes, detect overlapping weekend dates, and export a standard `.ics` calendar file for Google Calendar or Apple Calendar.
- **Multi-Source Belgian Calendar Aggregation**:
  - **FRBE-KBSB-KSB** (`frbe-kbsb-ksb.be`) — National calendar & club directory
  - **VSF** (`vlaamseschaakfederatie.be`) — Flemish calendar & *Vlaams Jeugdschaakcriterium*
  - **FEFB** (`fefb.be`) — Francophone calendar & *Circuit JEF (Jeunes Échecs Francophones)*
  - **SVDB** — East Belgium tournaments
  - **Chess-Results (`fed=BEL`)** — Tournament `tnr` discovery and player counts

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
