import { NextRequest, NextResponse } from 'next/server';
import { getAllTournamentsEnriched, upsertTournaments } from '@/db';
import { resolveBelgianLocation } from '@/lib/belgium-geo';
import { Tournament, TournamentCategory, TimeControlType, CircuitType } from '@/db/schema';

export async function GET() {
  const tournaments = getAllTournamentsEnriched();
  return NextResponse.json({ tournaments });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const loc = resolveBelgianLocation(body.postalCode || body.city || '1000');

    const title = (body.title || 'Belgian Chess Tournament').trim();
    const category: TournamentCategory = body.category || 'both';
    const timeControl: TimeControlType = body.timeControl || 'rapid';
    const circuit: CircuitType = body.circuit || 'OPEN';

    const newTournament: Tournament = {
      id: `custom-${Date.now()}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      englishSummary:
        body.englishSummary ||
        `Added tournament in ${loc.city} (${timeControl.toUpperCase()}, suitable for ${
          category === 'youth' ? 'Youth categories' : 'Youth & Mixed Open players'
        }).`,
      startDate: body.startDate || '2026-12-13',
      endDate: body.endDate || body.startDate || '2026-12-13',
      rounds: Number(body.rounds) || 7,
      timeControl,
      timeControlDetails: body.timeControlDetails || '15 min + 5 sec/move',
      category,
      circuit,
      ageGroups: body.ageGroups || ['U10', 'U12', 'Open'],
      city: loc.city,
      postalCode: loc.postalCode,
      province: loc.province,
      region: loc.region,
      venueAddress: body.venueAddress || `${loc.city}, ${loc.postalCode} Belgium`,
      lat: loc.lat,
      lng: loc.lng,
      organizerClub: body.organizerClub || 'Local Belgian Chess Club',
      clubMatricule: body.clubMatricule || '000',
      entryFee: body.entryFee || '€10',
      scheduleSummary: body.scheduleSummary || 'Round 1 at 10:15',
      officialUrl: body.officialUrl || 'https://www.frbe-kbsb-ksb.be',
      flyerUrl: body.flyerUrl || body.officialUrl || 'https://www.frbe-kbsb-ksb.be',
      chessResultsUrl:
        body.chessResultsUrl ||
        (body.chessResultsTnr
          ? `https://chess-results.com/tnr${body.chessResultsTnr}.aspx?lan=1`
          : 'https://chess-results.com/fed.aspx?lan=1&fed=BEL'),
      chessResultsTnr: body.chessResultsTnr || '',
      registeredPlayersCount: Number(body.registeredPlayersCount) || 45,
      isFideRated: Boolean(body.isFideRated),
      isNationalRated: true,
      sources: ['Custom / Club Flyer Import'],
      updatedAt: new Date().toISOString(),
    };

    upsertTournaments([newTournament]);
    const tournaments = getAllTournamentsEnriched();
    return NextResponse.json({ tournament: newTournament, tournaments });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid tournament payload' },
      { status: 400 }
    );
  }
}
