import { WclTable, type WCLDamageDoneTableResponse, type WCLResponseJSON } from 'common/WCL_TYPES';
import makeWclUrl from 'common/makeWclUrl';
import { wclGameVersionToExpansion } from 'game/VERSIONS';
import type Expansion from 'game/Expansion';
import type { AnyEvent } from 'parser/core/Events';
import type { PlayerDetails } from 'parser/core/Player';
import type Report from 'parser/core/Report';
import type { ReportSource } from 'parser/core/Report';

import type {
  AnalysisDataSource,
  EventQuery,
  ExternalReportLinks,
  FilteredEventQuery,
} from '../AnalysisDataSource';
import { WclReportClient } from './WclReportClient';

/** Browser-native Warcraft Logs source backed by the v2 user GraphQL API. */
export class WarcraftLogsDataSource implements AnalysisDataSource {
  // A static deployment never sends parser metrics to a WoWAnalyzer application server.
  readonly canUploadMetrics = false;
  readonly externalLinks: ExternalReportLinks;
  private readonly client: WclReportClient;
  private expansion?: Expansion;

  constructor(readonly locator: Extract<ReportSource, { kind: 'warcraft-logs' }>) {
    this.client = new WclReportClient(locator);
    const link = (fightId: number, playerId: number, type: string) =>
      makeWclUrl(this.locator.code, { fight: fightId, source: playerId, type }, this.expansion);
    this.externalLinks = {
      originalReport: (fightId) =>
        makeWclUrl(this.locator.code, { fight: fightId }, this.expansion),
      wipefest: (fightId) =>
        `https://www.wipefest.net/report/${this.locator.code}/fight/${fightId}`,
      damageDone: (fightId, playerId) => link(fightId, playerId, 'damage-done'),
      healingDone: (fightId, playerId) => link(fightId, playerId, 'healing'),
      damageTaken: (fightId, playerId) => link(fightId, playerId, 'damage-taken'),
      deaths: (fightId, playerId) => link(fightId, playerId, 'deaths'),
    };
  }

  async loadReport(): Promise<Report> {
    const report = await this.client.loadReport();
    this.expansion = wclGameVersionToExpansion(report.gameVersion);
    return report;
  }

  refreshReport(): Promise<Report> {
    return this.loadReport();
  }

  loadPlayers(fightId: number): Promise<PlayerDetails[]> {
    return this.client.loadPlayers(fightId);
  }

  loadEvents(query: EventQuery): Promise<AnyEvent[]> {
    return this.client.loadEvents({
      fightId: query.fightId,
      start: query.start,
      end: query.end,
      actorId: query.actorId,
      abilityId: query.abilityId,
      dataType: query.dataType,
      maxPages: query.maxPages,
      onProgress: query.onProgress,
      signal: query.signal,
    });
  }

  loadFilteredEvents(query: FilteredEventQuery): Promise<AnyEvent[]> {
    return this.client.loadEvents({
      fightId: query.fightId,
      start: query.start,
      end: query.end,
      actorId: query.actorId,
      abilityId: query.abilityId,
      dataType: query.dataType,
      filter: query.filter,
      maxPages: query.maxPages,
      onProgress: query.onProgress,
      signal: query.signal,
    });
  }

  loadDamageDoneTable(query: {
    fightStart: number;
    fightEnd: number;
    playerId: number;
  }): Promise<WCLDamageDoneTableResponse> {
    return this.client.loadTable({
      start: query.fightStart,
      end: query.fightEnd,
      dataType: WclTable.DamageDone,
      sourceId: query.playerId,
    });
  }

  loadTable<T extends WCLResponseJSON>(query: {
    fightStart: number;
    fightEnd: number;
    dataType: string;
    playerId?: number;
    filter?: string;
    signal?: AbortSignal;
  }): Promise<T> {
    return this.client.loadTable({
      start: query.fightStart,
      end: query.fightEnd,
      dataType: query.dataType,
      sourceId: query.playerId,
      filter: query.filter,
      signal: query.signal,
    });
  }

  loadGraph<T extends WCLResponseJSON>(query: {
    fightStart: number;
    fightEnd: number;
    dataType: string;
    playerId?: number;
    filter?: string;
    signal?: AbortSignal;
  }): Promise<T> {
    return this.client.loadGraph({
      start: query.fightStart,
      end: query.fightEnd,
      dataType: query.dataType,
      sourceId: query.playerId,
      filter: query.filter,
      signal: query.signal,
    });
  }
}
