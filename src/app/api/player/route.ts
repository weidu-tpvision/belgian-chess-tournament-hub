import { NextRequest, NextResponse } from 'next/server';
import {
  getPlayerProfile,
  updatePlayerProfile,
  getPlayerEntries,
  upsertPlayerEntry,
  getAllTournamentsEnriched,
} from '@/db';
import {
  resolveBelgianLocation,
  getBelgianAgeCategory,
} from '@/lib/belgium-geo';
import { lookupChessResultsTnr } from '@/lib/scrapers/chessResults';
import {
  lookupFederationPlayerProfile,
  BELGIAN_CLUBS_BY_MATRICULE,
} from '@/lib/scrapers/frbe';

function parseRating(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') return fallback;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? Math.round(num) : fallback;
}

export async function GET() {
  const profile = getPlayerProfile();
  const entries = getPlayerEntries();
  return NextResponse.json({ profile, entries });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = getPlayerProfile();

    const postalInput = String(
      body.homePostalCode ?? existing.homePostalCode ?? '1000'
    ).trim();
    const cityInput = String(body.homeCity ?? existing.homeCity ?? '').trim();

    // If postal code changed, resolve primarily by postal code; otherwise allow city or postal code
    const loc = resolveBelgianLocation(
      postalInput || cityInput || '1000',
      cityInput
    );

    const clubMatricule = String(
      body.clubMatricule ?? existing.clubMatricule ?? '201'
    ).trim();
    let clubName = String(body.clubName ?? existing.clubName ?? '').trim();
    if (
      clubMatricule !== existing.clubMatricule &&
      BELGIAN_CLUBS_BY_MATRICULE[clubMatricule] &&
      (!body.clubName || body.clubName === existing.clubName)
    ) {
      clubName = BELGIAN_CLUBS_BY_MATRICULE[clubMatricule].clubName;
    }

    const birthYearNum = Number(body.birthYear);
    const birthYear =
      Number.isFinite(birthYearNum) && birthYearNum >= 1920 && birthYearNum <= 2025
        ? Math.round(birthYearNum)
        : existing.birthYear;

    const updated = updatePlayerProfile({
      fullName: String(body.fullName || existing.fullName).trim(),
      birthYear,
      belgianMatricule: String(
        body.belgianMatricule ?? existing.belgianMatricule
      ).trim(),
      fideId: String(body.fideId ?? existing.fideId).trim(),
      clubName: clubName || existing.clubName,
      clubMatricule: clubMatricule || existing.clubMatricule,
      belgianElo: parseRating(body.belgianElo, existing.belgianElo),
      fideStandardElo: parseRating(
        body.fideStandardElo,
        existing.fideStandardElo
      ),
      fideRapidElo: parseRating(body.fideRapidElo, existing.fideRapidElo),
      fideBlitzElo: parseRating(body.fideBlitzElo, existing.fideBlitzElo),
      homeCity: loc.city,
      homePostalCode: loc.postalCode,
      homeLat: loc.lat,
      homeLng: loc.lng,
    });

    const tournaments = getAllTournamentsEnriched();
    return NextResponse.json({ profile: updated, tournaments });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update profile' },
      { status: 400 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support FRBE / FIDE Federation Rating & Club Auto-Lookup
    if (body.action === 'lookup-federation') {
      const result = await lookupFederationPlayerProfile({
        belgianMatricule: body.belgianMatricule,
        fideId: body.fideId,
        fullName: body.fullName,
        clubMatricule: body.clubMatricule,
      });
      return NextResponse.json(result);
    }

    const profile = getPlayerProfile();
    const tournaments = getAllTournamentsEnriched();
    const { ageCategory } = getBelgianAgeCategory(profile.birthYear);

    const entry = await lookupChessResultsTnr(
      body.chessResultsTnr || '1048291',
      profile.fullName,
      tournaments,
      profile.belgianElo || profile.fideRapidElo,
      ageCategory
    );
    upsertPlayerEntry(entry);
    const entries = getPlayerEntries();
    return NextResponse.json({ entry, entries });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to sync tnr' },
      { status: 400 }
    );
  }
}

