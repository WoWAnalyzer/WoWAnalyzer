import fetchWcl, { fetchEvents, fetchFights, fetchTable } from 'common/fetchWclApi';
import {
  WclTable,
  type WCLDamageDoneTableResponse,
  type WCLRankingsResponse,
} from 'common/WCL_TYPES';
import { makeCharacterApiUrl } from 'common/makeApiUrl';
import makeWclUrl from 'common/makeWclUrl';
import { wclGameVersionToBranch, wclGameVersionToExpansion } from 'game/VERSIONS';
import type Expansion from 'game/Expansion';
import type CharacterProfile from 'parser/core/CharacterProfile';
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

export class WarcraftLogsDataSource implements AnalysisDataSource {
  readonly canUploadMetrics = true;
  readonly externalLinks: ExternalReportLinks;
  private expansion?: Expansion;

  constructor(readonly locator: Extract<ReportSource, { kind: 'warcraft-logs' }>) {
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

  async loadReport(options?: { refresh?: boolean }): Promise<Report> {
    const report = await fetchFights(this.locator.code, options?.refresh);
    this.expansion = wclGameVersionToExpansion(report.gameVersion);
    return {
      ...report,
      code: this.locator.code,
      isAnonymous: this.locator.isAnonymous,
      locator: this.locator,
    };
  }

  refreshReport(): Promise<Report> {
    return this.loadReport({ refresh: true });
  }

  async loadPlayers(fightId: number): Promise<PlayerDetails[]> {
    const response = await fetch(`/api/v2/report/${this.locator.code}/fight/${fightId}/players`);
    return (await response.json()).players;
  }

  loadEvents(query: EventQuery): Promise<AnyEvent[]> {
    return fetchEvents(
      this.locator.code,
      query.start ?? 0,
      query.end ?? 0,
      query.actorId,
      undefined,
      query,
    );
  }

  loadFilteredEvents(query: FilteredEventQuery): Promise<AnyEvent[]> {
    return fetchEvents(
      this.locator.code,
      query.start ?? 0,
      query.end ?? 0,
      query.actorId,
      query.filter,
      query,
    );
  }

  async loadCharacterProfile(
    report: Report,
    player: PlayerDetails,
  ): Promise<CharacterProfile | null> {
    const exported = report.exportedCharacters?.find((character) => character.name === player.name);
    if (exported?.region.toLowerCase() === 'cn') {
      return null;
    }
    const response = await fetch(
      makeCharacterApiUrl(
        player.guid,
        exported?.region,
        exported?.server,
        exported?.name,
        wclGameVersionToBranch(report.gameVersion) === 'classic',
      ),
    );
    return response.ok ? response.json() : null;
  }

  loadDamageDoneTable(query: {
    fightStart: number;
    fightEnd: number;
    playerId: number;
  }): Promise<WCLDamageDoneTableResponse> {
    return fetchTable(
      this.locator.code,
      query.fightStart,
      query.fightEnd,
      WclTable.DamageDone,
      query.playerId,
    );
  }

  loadEncounterRankings(query: {
    encounterId: number;
    className: string;
    specName: string;
    difficulty: number;
    limit: number;
    metric: 'dps' | 'hps';
    cache: number;
  }): Promise<WCLRankingsResponse> {
    return fetchWcl(`rankings/encounter/${query.encounterId}`, {
      className: query.className,
      specName: query.specName,
      difficulty: query.difficulty,
      limit: query.limit,
      metric: query.metric,
      cache: query.cache,
      includeCombatantInfo: true,
    });
  }
}
