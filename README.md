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
  - **FRBE-KBSB-KSB & BYCCO** (`frbe-kbsb-ksb.be`, `blog.frbe-kbsb-ksb.be`, `bycco.be`) — National championships (*Belgisch Kampioenschap Snelschaak & Chess960 Lier*, *BYCC / BJK / CBJ 2027 Turnhout*, *Belgisch Kampioenschap Schaken 2027 Mechelen*), Open tournaments, & club directory
  - **VSF & Vlaams Jeugdschaakcriterium** (`vlaamseschaakfederatie.be`, `sites.google.com/view/vlaams-jeugdschaakcriterium`, `kmsk.eu/kalender`, `schaakliga-antwerpen.be`) — Flemish youth criterium stages (*Brasschaat*, *Limburg/Genk*, *Aalter*, *Landegem*, *Oostende*), *Mechels FIDE Jeugdtoernooi*, *Stapjestoernooi Mechelen*, *Kersttornooien SK Artevelde Ertvelde*, & *Brugse Meesters*
  - **FEFB & Circuit JEF** (`fefb.be/jef/etapes`, `fefb.net`) — Francophone calendar, *Circuit JEF (Jeunes Échecs Francophones)* stages (*Wavre Étape 8*, *Namur Étape 9 Finale* at IATA Namur), *2e Rapide de Saint-Nicolas (Chapelle-lez-Herlaimont)*, & *9e Triathlon d'Anderlues*
  - **Chess-Results (`fed=BEL`)** (`chess-results.com/fed.aspx?lan=1&fed=BEL`) — Tournament `tnr` discovery, section pairings, and player counts
- **Serverless & Local Persistence**:
  - Persists to `data/chess-hub-db.json` locally and automatically falls back to `/tmp/chess-hub-db.json` (plus in-memory state) on read-only serverless filesystems such as Vercel, with automatic seed versioning (`CURRENT_SEED_VERSION`) to refresh stale local stores when official tournament schedules are updated.

## Verified 2026–2027 Belgian Tournament Calendar Highlights

| Date(s) | Tournament | City (`Postal`) | Circuit / Source |
| :--- | :--- | :--- | :--- |
| **21–22 Nov 2026** | Belgisch Kampioenschap Snelschaak (Blitz) & Chess960 | Lier (`2500`) | `NATIONAL` (FRBE-KBSB & ChessLooks Lier) |
| **22 Nov 2026** | Circuit JEF 2026 — Étape 9 (Finale) : Namur (IATA Namur) | Namur (`5000`) | `JEF` (FEFB & Royal Namur Échecs) |
| **22 Nov 2026 – 21 Feb 2027** | Mechels FIDE-rated Jeugdtoernooi (`<1800` FIDE, U20) | Mechelen (`2800`) | `VSF_YOUTH` (KMSK Mechelen & Schaakliga Antwerpen) |
| **5 Dec 2026** | 2e Rapide de Saint-Nicolas (11-round FIDE Rapid) | Chapelle-lez-Herlaimont (`7160`) | `OPEN` (FEFB & L'Échiquier du Centre) |
| **26–30 Dec 2026** | Kersttornooien 2026 — Jeugd, Open & Blitz | Ertvelde (`9940`) | `OPEN` (SK Artevelde & VSF) |
| **8–10 Jan 2027** | 9e Triathlon d'Anderlues (Blitz, Standard & Rapid) | Anderlues (`6150`) | `OPEN` (FEFB & CELB Anderlues) |
| **17 Jan 2027** | Stapjestoernooi Mechelen 2027 (BA Pitzemburg) | Mechelen (`2800`) | `VSF_YOUTH` (KMSK Mechelen) |
| **28 Feb 2027** | Vlaams Jeugdschaakcriterium — Brasschaat (GIB) | Brasschaat (`2930`) | `VSF_YOUTH` (Vlaams Jeugdschaakcriterium) |
| **27 Mar 2027** | Vlaams Jeugdschaakcriterium — Limburg (Atlas College) | Genk (`3600`) | `VSF_YOUTH` (Vlaams Jeugdschaakcriterium) |
| **2 May 2027** | Vlaams Jeugdschaakcriterium — Aalter (Sportpark) | Aalter (`9880`) | `VSF_YOUTH` (Vlaams Jeugdschaakcriterium) |
| **6–9 May 2027** | Belgian Youth Chess Championship 2027 (BJK / CBJ / BYCC) | Turnhout (`2300`) | `NATIONAL` (BYCCO VZW & FRBE-KBSB) |
| **26 Jun 2027** | Vlaams Jeugdschaakcriterium — Landegem | Landegem (`9850`) | `VSF_YOUTH` (Vlaams Jeugdschaakcriterium) |
| **3–11 Jul 2027** | Belgisch Kampioenschap Schaken 2027 (BK Classical) | Mechelen (`2800`) | `NATIONAL` (FRBE-KBSB & KMSK Mechelen) |
| **4 Jul 2027** | Vlaams Jeugdschaakcriterium — Oostende | Ostend (`8400`) | `VSF_YOUTH` (Vlaams Jeugdschaakcriterium) |
| **7–13 Aug 2027** | Brugse Meesters 2027 (Open, `<1800` & Seniors) | Bruges (`8000`) | `OPEN` (KBSK Brugge & VSF) |

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

