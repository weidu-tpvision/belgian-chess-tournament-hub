import { fetchFrbeTournaments } from './frbe';
import { fetchVsfTournaments } from './vsf';
import { fetchFefbTournaments } from './fefb';
import { fetchChessResultsBelgium } from './chessResults';
import { upsertTournaments, appendSyncLogs } from '@/db';
import { SyncLog } from '@/db/schema';

export async function runAllBelgianScrapers(): Promise<{
  logs: SyncLog[];
  totalAdded: number;
  totalUpdated: number;
}> {
  const logs: SyncLog[] = [];
  let totalAdded = 0;
  let totalUpdated = 0;

  const sources = [
    { name: 'FRBE-KBSB-KSB Calendar & Rating Server', fn: fetchFrbeTournaments },
    { name: 'VSF & Vlaams Jeugdschaakcriterium', fn: fetchVsfTournaments },
    { name: 'FEFB & Circuit JEF (Jeunes Échecs Francophones)', fn: fetchFefbTournaments },
    { name: 'Chess-Results.com (fed=BEL)', fn: fetchChessResultsBelgium },
  ];

  for (const src of sources) {
    const startedAt = new Date().toISOString();
    const res = await src.fn();
    const { added, updated } = upsertTournaments(res.tournaments);
    totalAdded += added;
    totalUpdated += updated;
    logs.push({
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      source: src.name,
      status: res.status === 'success' ? 'success' : 'fallback',
      itemsProcessed: res.tournaments.length,
      newEventsAdded: added,
      startedAt,
      completedAt: new Date().toISOString(),
      message: res.message,
    });
  }

  appendSyncLogs(logs);
  return { logs, totalAdded, totalUpdated };
}
