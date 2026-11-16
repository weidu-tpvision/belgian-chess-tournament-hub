import { NextResponse } from 'next/server';
import { getSyncLogs, getAllTournamentsEnriched } from '@/db';
import { runAllBelgianScrapers } from '@/lib/scrapers/sync';

export async function GET() {
  const logs = getSyncLogs();
  return NextResponse.json({ logs });
}

export async function POST() {
  const { totalAdded, totalUpdated } = await runAllBelgianScrapers();
  const logs = getSyncLogs();
  const tournaments = getAllTournamentsEnriched();
  return NextResponse.json({
    logs,
    tournaments,
    totalAdded,
    totalUpdated,
  });
}
