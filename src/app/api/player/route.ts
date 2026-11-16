import { NextRequest, NextResponse } from 'next/server';
import {
  getPlayerProfile,
  updatePlayerProfile,
  getPlayerEntries,
  upsertPlayerEntry,
  getAllTournamentsEnriched,
} from '@/db';
import { resolveBelgianLocation } from '@/lib/belgium-geo';
import { lookupChessResultsTnr } from '@/lib/scrapers/chessResults';

export async function GET() {
  const profile = getPlayerProfile();
  const entries = getPlayerEntries();
  return NextResponse.json({ profile, entries });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const loc = resolveBelgianLocation(
      body.homePostalCode || body.homeCity || '1000'
    );

    const updated = updatePlayerProfile({
      fullName: body.fullName,
      birthYear: Number(body.birthYear) || 2017,
      belgianMatricule: body.belgianMatricule,
      fideId: body.fideId,
      clubName: body.clubName,
      belgianElo: Number(body.belgianElo) || 1342,
      fideStandardElo: Number(body.fideStandardElo) || 1418,
      fideRapidElo: Number(body.fideRapidElo) || 1455,
      fideBlitzElo: Number(body.fideBlitzElo) || 1390,
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
    const profile = getPlayerProfile();
    const entry = await lookupChessResultsTnr(
      body.chessResultsTnr || '1048291',
      profile.fullName
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
