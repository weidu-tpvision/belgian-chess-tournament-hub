import { NextRequest, NextResponse } from 'next/server';
import {
  upsertBookmark,
  removeBookmark,
  getAllTournamentsEnriched,
} from '@/db';
import { BookmarkStatus } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tournamentId, status, section, notes } = body as {
      tournamentId: string;
      status: BookmarkStatus | null;
      section?: string;
      notes?: string;
    };

    if (!tournamentId) {
      return NextResponse.json(
        { error: 'tournamentId is required' },
        { status: 400 }
      );
    }

    if (!status) {
      removeBookmark(tournamentId);
    } else {
      upsertBookmark({
        tournamentId,
        status,
        section: section || 'U10',
        notes: notes || '',
        updatedAt: new Date().toISOString(),
      });
    }

    const tournaments = getAllTournamentsEnriched();
    return NextResponse.json({ tournaments });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update bookmark' },
      { status: 400 }
    );
  }
}
