import type { AnyEvent } from 'parser/core/Events';
import type { PlayerDetails } from 'parser/core/Player';
import type Report from 'parser/core/Report';
import type { ReportSource } from 'parser/core/Report';
import { getLocalEvents, getReadyLocalReport } from './localReportStore';
import type { AnalysisDataSource, EventQuery } from 'report-data/AnalysisDataSource';

export class LocalCombatLogDataSource implements AnalysisDataSource {
  readonly canUploadMetrics = false;
  constructor(readonly locator: Extract<ReportSource, { kind: 'local' }>) {}
  async loadReport(): Promise<Report> {
    return (await getReadyLocalReport(this.locator.id)).report;
  }
  async loadPlayers(fightId: number): Promise<PlayerDetails[]> {
    return (await getReadyLocalReport(this.locator.id)).players[fightId] ?? [];
  }
  loadEvents(query: EventQuery): Promise<AnyEvent[]> {
    return getLocalEvents(this.locator.id, query.fightId, query.start, query.end, query.actorId);
  }
}
