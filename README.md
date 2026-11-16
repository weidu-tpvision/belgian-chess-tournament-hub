# Belgian Chess Tournament Hub

A responsive full-stack TypeScript web application (Next.js App Router) for discovering, filtering, planning, and tracking **Youth** (`U8`, `U10`, `U12`, **Circuit JEF**, **Vlaams Jeugdschaakcriterium**, **Belgian Youth Championship**) and **Mixed Open** chess tournaments across Belgium.

## Features

- **Multi-Source Belgian Calendar Aggregation**:
  - **FRBE-KBSB-KSB** (`frbe-kbsb-ksb.be`) — National calendar & Belgian ELO ratings
  - **VSF** (`vlaamseschaakfederatie.be`) — Flemish calendar & *Vlaams Jeugdschaakcriterium*
  - **FEFB** (`fefb.be`) — Francophone calendar & *Circuit JEF (Jeunes Échecs Francophones)*
  - **SVDB** — East Belgium tournaments
  - **Chess-Results (`fed=BEL`)** — Tournament `tnr` discovery, player counts, and live round pairings
- **Interactive Map of Belgium**:
  - Displays Youth, Combined Youth + Mixed Open, and Mixed Open pins across Flanders, Brussels, and Wallonia with a customizable road-distance radius around your home postal code.
- **Personal Schedule & `.ics` Calendar Feed**:
  - Mark tournaments as **Registered** or **Interested**, detect overlapping weekend dates, and export a standard `.ics` calendar file for Google Calendar or Apple Calendar.
- **Player Profile & Live Chess-Results Tracker**:
  - Configure your son's Belgian Matricule, FIDE ID, birth year, ratings, and home postal code, and track round-by-round pairings and rating performance (`TPR`).

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.
