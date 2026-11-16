import { NextResponse } from 'next/server';
import { getAllTournamentsEnriched, getPlayerProfile } from '@/db';

function formatIcalDate(dateStr: string, endExclusive = false): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (endExclusive) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

export async function GET() {
  const tournaments = getAllTournamentsEnriched();
  const profile = getPlayerProfile();
  const bookmarked = tournaments.filter(
    (t) =>
      t.bookmark &&
      (t.bookmark.status === 'registered' || t.bookmark.status === 'interested')
  );

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Belgian Chess Hub//Youth & Open Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${profile.fullName} — Belgian Chess Schedule`,
  ];

  for (const t of bookmarked) {
    const statusPrefix =
      t.bookmark?.status === 'registered' ? '[REGISTERED]' : '[INTERESTED]';
    const dtStart = formatIcalDate(t.startDate, false);
    const dtEnd = formatIcalDate(t.endDate, true);
    const desc = [
      `Status: ${t.bookmark?.status.toUpperCase()} (${t.bookmark?.section || 'U10'})`,
      `Format: ${t.rounds} rounds • ${t.timeControlDetails}`,
      `Distance from ${profile.homeCity}: ${t.distanceKm} km (~${t.estimatedDriveMinutes} min drive)`,
      `Schedule: ${t.scheduleSummary}`,
      t.bookmark?.notes ? `Notes: ${t.bookmark.notes}` : '',
      `Chess-Results: ${t.chessResultsUrl}`,
      `Official Link: ${t.officialUrl}`,
    ]
      .filter(Boolean)
      .join('\\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${t.id}@belgian-chess-hub.local`,
      `DTSTAMP:20261116T080000Z`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:${statusPrefix} ${t.title} (${t.city})`,
      `LOCATION:${t.venueAddress.replace(/,/g, '\\,')}`,
      `DESCRIPTION:${desc}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');

  return new NextResponse(lines.join('\r\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="belgian-chess-schedule.ics"',
    },
  });
}
