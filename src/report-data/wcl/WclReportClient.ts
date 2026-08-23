import type { WCLResponseJSON } from 'common/WCL_TYPES';
import SPECS from 'game/SPECS';
import { specRoleFromGameRole } from 'game/getSpecMetadata';
import type { AnyEvent, CombatantInfoEvent } from 'parser/core/Events';
import { EventType } from 'parser/core/Events';
import type { PlayerDetails } from 'parser/core/Player';
import type Report from 'parser/core/Report';

import { queryWcl } from './WclGraphqlClient';

interface V2Actor {
  id: number;
  name: string;
  type: string;
  subType?: string;
  gameID?: number;
  icon?: string;
  petOwner?: number;
  server?: string;
}

interface V2FightNpc {
  id: number;
  instanceCount?: number;
  groupCount?: number;
}

interface V2Fight {
  id: number;
  encounterID: number;
  originalEncounterID?: number;
  startTime: number;
  endTime: number;
  name: string;
  size?: number;
  difficulty?: number;
  kill?: boolean;
  bossPercentage?: number;
  fightPercentage?: number;
  hardModeLevel?: number;
  friendlyPlayers?: number[];
  friendlyItemLevels?: number[];
  friendlyPets?: V2FightNpc[];
  enemyNPCs?: V2FightNpc[];
  enemyPets?: V2FightNpc[];
  phaseTransitions?: { id: number; startTime: number }[];
  dungeonPulls?: {
    id: number;
    encounterID: number;
    startTime: number;
    endTime: number;
    name: string;
    kill?: boolean;
    enemyNPCs?: { id: number }[];
  }[];
}

interface V2Report {
  code: string;
  title: string;
  owner?: { name: string };
  startTime: number;
  endTime: number;
  zone?: { id: number };
  masterData: {
    lang?: string;
    logVersion: number;
    gameVersion?: number;
    actors?: V2Actor[];
  };
  fights?: V2Fight[];
}

interface ReportEnvelope {
  reportData: { report: V2Report | null };
}

interface EventsEnvelope {
  reportData: {
    report: {
      events: { data?: AnyEvent[]; nextPageTimestamp?: number } | null;
    } | null;
  };
}

export class WclReportNotFoundError extends Error {
  constructor() {
    super('This Warcraft Logs report does not exist or is not available to the signed-in user.');
    this.name = 'WclReportNotFoundError';
  }
}

const REPORT_QUERY = `
  query WoWAReport($code: String!) {
    reportData {
      report(code: $code, allowUnlisted: true) {
        code title startTime endTime
        owner { name }
        zone { id }
        masterData(translate: true) {
          lang logVersion gameVersion
          actors { id name type subType gameID icon petOwner server }
        }
        fights(translate: true) {
          id encounterID originalEncounterID startTime endTime name size difficulty kill
          bossPercentage fightPercentage hardModeLevel
          friendlyPlayers friendlyItemLevels
          friendlyPets { id instanceCount groupCount }
          enemyNPCs { id instanceCount groupCount }
          enemyPets { id instanceCount groupCount }
          phaseTransitions { id startTime }
          dungeonPulls {
            id encounterID startTime endTime name kill
            enemyNPCs { id }
          }
        }
      }
    }
  }
`;

const EVENTS_QUERY = `
  query WoWAEvents(
    $code: String!, $fightIds: [Int], $start: Float, $end: Float,
    $sourceId: Int, $abilityId: Float, $filter: String, $dataType: EventDataType
  ) {
    reportData {
      report(code: $code, allowUnlisted: true) {
        events(
          fightIDs: $fightIds, startTime: $start, endTime: $end,
          sourceID: $sourceId, abilityID: $abilityId,
          filterExpression: $filter, dataType: $dataType,
          translate: true, includeResources: true
        ) { data nextPageTimestamp }
      }
    }
  }
`;

const componentQuery = (field: 'table' | 'graph') => `
  query WoWAComponent(
    $code: String!, $start: Float!, $end: Float!, $sourceId: Int,
    $filter: String, $dataType: ${field === 'table' ? 'TableDataType' : 'GraphDataType'}!
  ) {
    reportData {
      report(code: $code, allowUnlisted: true) {
        ${field}(
          startTime: $start, endTime: $end, sourceID: $sourceId,
          filterExpression: $filter, dataType: $dataType, translate: true
        )
      }
    }
  }
`;

const tableDataType = (value: string) =>
  ({
    summary: 'Summary',
    'damage-done': 'DamageDone',
    'damage-taken': 'DamageTaken',
    healing: 'Healing',
    casts: 'Casts',
    summons: 'Summons',
    buffs: 'Buffs',
    debuffs: 'Debuffs',
    deaths: 'Deaths',
    survivability: 'Survivability',
    resources: 'Resources',
    'resource-gains': 'Resources',
    threat: 'Threat',
  })[value] ?? value;

const actorFightIds = (actorId: number, fights: V2Fight[], key: keyof V2Fight) =>
  fights.flatMap((fight) => {
    const participants = fight[key];
    const present = Array.isArray(participants)
      ? participants.some((participant) =>
          typeof participant === 'number' ? participant === actorId : participant.id === actorId,
        )
      : false;
    return present ? [fight.id] : [];
  });

const unit = (actor: V2Actor) => ({
  id: actor.id,
  name: actor.name,
  guid: actor.gameID ?? actor.id,
  type: actor.type,
  subType: actor.subType ?? actor.type,
  icon: actor.icon ?? actor.subType ?? actor.type,
});

export const adaptV2Report = (
  report: V2Report,
  locator: Extract<Report['locator'], { kind: 'warcraft-logs' }>,
): Report => {
  const fights = report.fights ?? [];
  const actors = report.masterData.actors ?? [];
  const players = actors.filter((actor) => actor.type === 'Player');
  const pets = actors.filter((actor) => actor.type === 'Pet');
  const npcs = actors.filter((actor) => actor.type === 'NPC');

  return {
    code: report.code,
    locator,
    isAnonymous: locator.isAnonymous,
    title: report.title,
    owner: report.owner?.name ?? '',
    start: report.startTime,
    end: report.endTime,
    zone: report.zone?.id ?? 0,
    lang: report.masterData.lang ?? 'en',
    logVersion: report.masterData.logVersion,
    gameVersion: report.masterData.gameVersion ?? 1,
    exportedCharacters: [],
    phases: [],
    fights: fights.map((fight) => ({
      id: fight.id,
      start_time: fight.startTime,
      end_time: fight.endTime,
      boss: fight.encounterID,
      originalBoss: fight.originalEncounterID,
      name: fight.name,
      size: fight.size,
      difficulty: fight.difficulty,
      kill: fight.kill,
      bossPercentage: fight.bossPercentage,
      fightPercentage: fight.fightPercentage,
      hardModeLevel: fight.hardModeLevel,
      phases: fight.phaseTransitions,
      dungeonPulls: fight.dungeonPulls?.map((pull) => ({
        id: pull.id,
        boss: pull.encounterID,
        start_time: pull.startTime,
        end_time: pull.endTime,
        name: pull.name,
        kill: pull.kill,
        enemies: pull.enemyNPCs?.map((enemy) => [enemy.id]),
      })),
    })),
    friendlies: players.map((actor) => ({
      ...unit(actor),
      region: '',
      server: actor.server,
      fights: actorFightIds(actor.id, fights, 'friendlyPlayers').map((id) => ({ id })),
    })),
    enemies: npcs.map((actor) => ({
      ...unit(actor),
      fights: actorFightIds(actor.id, fights, 'enemyNPCs').map((id) => {
        const participant = fights
          .find((fight) => fight.id === id)
          ?.enemyNPCs?.find((npc) => npc.id === actor.id);
        return {
          id,
          groups: participant?.groupCount ?? 1,
          instances: participant?.instanceCount ?? 1,
        };
      }),
    })),
    friendlyPets: pets
      .filter((actor) => actorFightIds(actor.id, fights, 'friendlyPets').length > 0)
      .map((actor) => ({
        ...unit(actor),
        petOwner: actor.petOwner ?? 0,
        fights: actorFightIds(actor.id, fights, 'friendlyPets').map((id) => ({ id, instances: 1 })),
      })),
    enemyPets: pets
      .filter((actor) => actorFightIds(actor.id, fights, 'enemyPets').length > 0)
      .map((actor) => ({
        ...unit(actor),
        petOwner: actor.petOwner ?? 0,
        fights: actorFightIds(actor.id, fights, 'enemyPets').map((id) => ({ id, instances: 1 })),
      })),
  };
};

export class WclReportClient {
  private report?: Report;

  constructor(private readonly locator: Extract<Report['locator'], { kind: 'warcraft-logs' }>) {}

  async loadReport(signal?: AbortSignal) {
    const data = await queryWcl<ReportEnvelope>(
      REPORT_QUERY,
      { code: this.locator.code },
      { signal },
    );
    const report = data.reportData.report;
    if (!report) throw new WclReportNotFoundError();
    this.report = adaptV2Report(report, this.locator);
    return this.report;
  }

  async loadEvents(options: {
    fightId?: number;
    start?: number;
    end?: number;
    sourceId?: number;
    actorId?: number;
    abilityId?: number;
    filter?: string;
    dataType?: string;
    maxPages?: number;
    onProgress?: (progress: number) => void;
    signal?: AbortSignal;
  }): Promise<AnyEvent[]> {
    let start = options.start;
    const firstStart = start ?? 0;
    const end = options.end ?? 0;
    const duration = Math.max(1, end - firstStart);
    const events: AnyEvent[] = [];
    let page = 0;
    while (true) {
      const data = await queryWcl<EventsEnvelope>(
        EVENTS_QUERY,
        {
          code: this.locator.code,
          fightIds: options.fightId === undefined ? undefined : [options.fightId],
          start,
          end: options.end,
          sourceId: options.sourceId,
          abilityId: options.abilityId,
          filter:
            options.actorId === undefined
              ? options.filter
              : [
                  `(source.id = ${options.actorId} OR target.id = ${options.actorId})`,
                  options.filter && `(${options.filter})`,
                ]
                  .filter(Boolean)
                  .join(' AND '),
          dataType: options.dataType,
        },
        { signal: options.signal },
      );
      const pageData = data.reportData.report?.events;
      if (!pageData) throw new WclReportNotFoundError();
      events.push(...(pageData.data ?? []));
      page += 1;
      const next = pageData.nextPageTimestamp;
      options.onProgress?.(next === undefined ? 1 : Math.min(1, (next - firstStart) / duration));
      if (next === undefined) break;
      if (start !== undefined && next <= start) {
        throw new Error('Warcraft Logs event pagination did not advance.');
      }
      if (options.maxPages !== undefined && page >= options.maxPages) {
        throw new Error('Warcraft Logs event pagination exceeded the configured safety cap.');
      }
      start = next;
    }
    return events;
  }

  async loadPlayers(fightId: number): Promise<PlayerDetails[]> {
    const report = this.report ?? (await this.loadReport());
    const fight = report.fights.find((candidate) => candidate.id === fightId);
    if (!fight) throw new WclReportNotFoundError();
    const events = (await this.loadEvents({
      fightId,
      start: fight.start_time,
      end: fight.end_time,
      dataType: 'CombatantInfo',
    })) as CombatantInfoEvent[];

    return events.flatMap((event) => {
      if (event.type !== EventType.CombatantInfo) return [];
      const actor = report.friendlies.find((candidate) => candidate.id === event.sourceID);
      const spec = SPECS[event.specID];
      const role = spec && specRoleFromGameRole(spec.role);
      if (!actor || !spec || !role) return [];
      return [
        {
          id: actor.id,
          name: actor.name,
          server: actor.server ?? '',
          region: actor.region ?? '',
          className: spec.wclClassName,
          specName: spec.wclSpecName,
          specID: spec.id,
          role,
          guid: actor.guid,
          ilvl: undefined,
        },
      ];
    });
  }

  async loadTable<T extends WCLResponseJSON>(options: {
    start: number;
    end: number;
    dataType: string;
    sourceId?: number;
    filter?: string;
    signal?: AbortSignal;
  }): Promise<T> {
    const data = await queryWcl<{
      reportData: { report: { table: T | null } | null };
    }>(
      componentQuery('table'),
      {
        code: this.locator.code,
        start: options.start,
        end: options.end,
        sourceId: options.sourceId,
        filter: options.filter,
        dataType: tableDataType(options.dataType),
      },
      { signal: options.signal },
    );
    const table = data.reportData.report?.table;
    if (!table) throw new WclReportNotFoundError();
    return table;
  }

  async loadGraph<T extends WCLResponseJSON>(options: {
    start: number;
    end: number;
    dataType: string;
    sourceId?: number;
    filter?: string;
    signal?: AbortSignal;
  }): Promise<T> {
    const data = await queryWcl<{
      reportData: { report: { graph: T | null } | null };
    }>(
      componentQuery('graph'),
      {
        code: this.locator.code,
        start: options.start,
        end: options.end,
        sourceId: options.sourceId,
        filter: options.filter,
        dataType: tableDataType(options.dataType),
      },
      { signal: options.signal },
    );
    const graph = data.reportData.report?.graph;
    if (!graph) throw new WclReportNotFoundError();
    return graph;
  }
}
