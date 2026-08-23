import type CharacterProfile from 'parser/core/CharacterProfile';
import type { AnyEvent } from 'parser/core/Events';
import type { PlayerDetails } from 'parser/core/Player';
import type Report from 'parser/core/Report';
import type { ReportSource } from 'parser/core/Report';
import type { WCLDamageDoneTableResponse, WCLRankingsResponse } from 'common/WCL_TYPES';

export interface EventQuery {
  fightId: number;
  start?: number;
  end?: number;
  actorId?: number;
  /** An explicit safety cap. Omit for the complete primary analysis flow. */
  maxPages?: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface FilteredEventQuery extends EventQuery {
  filter: string;
}

export interface ExternalReportLinks {
  originalReport(fightId?: number): string;
  wipefest(fightId: number): string;
  damageDone(fightId: number, playerId: number): string;
  healingDone(fightId: number, playerId: number): string;
  damageTaken(fightId: number, playerId: number): string;
  deaths(fightId: number, playerId: number): string;
}

export interface AnalysisDataSource {
  readonly locator: ReportSource;
  readonly canUploadMetrics: boolean;
  readonly externalLinks?: ExternalReportLinks;
  loadReport(options?: { refresh?: boolean }): Promise<Report>;
  refreshReport?(): Promise<Report>;
  loadPlayers(fightId: number): Promise<PlayerDetails[]>;
  loadEvents(query: EventQuery): Promise<AnyEvent[]>;
  loadFilteredEvents?(query: FilteredEventQuery): Promise<AnyEvent[]>;
  loadCharacterProfile?(report: Report, player: PlayerDetails): Promise<CharacterProfile | null>;
  loadDamageDoneTable?(query: {
    fightStart: number;
    fightEnd: number;
    playerId: number;
  }): Promise<WCLDamageDoneTableResponse>;
  loadEncounterRankings?(query: {
    encounterId: number;
    className: string;
    specName: string;
    difficulty: number;
    limit: number;
    metric: 'dps' | 'hps';
    cache: number;
  }): Promise<WCLRankingsResponse>;
}
