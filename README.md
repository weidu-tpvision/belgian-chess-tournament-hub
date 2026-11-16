# Belgian Chess Tournament Hub

A responsive full-stack TypeScript web application (Next.js App Router) for discovering, filtering, planning, and tracking **Youth** (`U8`, `U10`, `U12`, `U14`, `U16`, `U18`, `U20`, **Circuit JEF**, **Vlaams Jeugdschaakcriterium**, **Belgian Youth Championship**) and **Mixed Open** chess tournaments across Belgium.

## Features

- **Multi-Source Belgian Calendar Aggregation**:
  - **FRBE-KBSB-KSB** (`frbe-kbsb-ksb.be`) — National calendar, club directory & Belgian ELO ratings
  - **VSF** (`vlaamseschaakfederatie.be`) — Flemish calendar & *Vlaams Jeugdschaakcriterium*
  - **FEFB** (`fefb.be`) — Francophone calendar & *Circuit JEF (Jeunes Échecs Francophones)*
  - **SVDB** — East Belgium tournaments
  - **Chess-Results (`fed=BEL`)** — Tournament `tnr` discovery, player counts, and live round pairings
- **Interactive Map of Belgium & Full Postal-Code Geocoding**:
  - Displays Youth, Combined Youth + Mixed Open, and Mixed Open pins across Flanders, Brussels, and Wallonia with a customizable road-distance radius around your home postal code.
  - Supports 60+ pre-mapped Belgian municipalities plus automatic provincial postal-zone resolution (`1000`–`9999`) for any 4-digit Belgian postal code.
- **Dynamic Age & Rating Eligibility Filtering**:
  - Automatically computes the player's Belgian youth category (`U8` through `U20` or `Open`) from their birth year and highlights eligible age-group and rating-capped sections (e.g., `Open <1500`, `Open <1600`, `1500–1900`) based on the player's current ELO.
- **Personal Schedule, Section/Notes Editor & `.ics` Calendar Feed**:
  - Mark tournaments as **Registered** or **Interested**, choose target playing sections, save personal logistics notes (e.g., carpool, lunch, hotel), detect overlapping weekend dates, and export a standard `.ics` calendar file for Google Calendar or Apple Calendar.
- **Player Profile, FRBE/FIDE Auto-Lookup & Chess-Results Tracker**:
  - Configure the player's Full Name, Birth Year, Belgian Matricule, FIDE ID, Affiliated Club & Club Matricule, Belgian/FIDE ratings (`BEL`, `Rapid`, `Standard`, `Blitz`, including `0` for unrated players), and Home Base (Postal Code & City).
  - Use **Lookup FRBE / FIDE** to auto-populate ratings and club affiliation from a Belgian Matricule or FIDE ID.
  - Sync any Belgian Chess-Results tournament by `tnr` ID, full URL, or quick-select hub pills to track round-by-round pairings, board numbers, and rating performance (`TPR`).

## API Endpoints

- `GET /api/tournaments` & `POST /api/tournaments` — List enriched tournaments (with Haversine road distance & drive time from the player's home base) or add a custom club flyer/tournament.
- `GET /api/player`, `PUT /api/player` & `POST /api/player` — Retrieve or update the player profile, run FRBE/FIDE federation rating lookups (`action: "lookup-federation"`), or sync Chess-Results `tnr` pairings.
- `POST /api/bookmarks` — Upsert or remove tournament bookmarks (`registered` / `interested`), target sections, and personal notes.
- `POST /api/sync` & `GET /api/sync` — Run federation calendar scrapers and view deduplication sync logs.
- `GET /api/ical` — Export `registered` and `interested` tournaments as a standard `.ics` calendar feed.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

