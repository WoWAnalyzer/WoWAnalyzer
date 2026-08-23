import type { WCLResponseJSON } from 'common/WCL_TYPES';
import type CombatLogParser from 'parser/core/CombatLogParser';
import type { AnyEvent } from 'parser/core/Events';

export class AnalysisCapabilityUnavailableError extends Error {
  constructor(capability: string) {
    super(`${capability} is unavailable for this report source.`);
    this.name = 'AnalysisCapabilityUnavailableError';
  }
}

interface LegacyQuery {
  [key: string]: unknown;
  start?: number;
  end?: number;
  actorid?: number;
  abilityid?: number;
  filter?: string;
}

export const loadParserTable = <T extends WCLResponseJSON>(
  owner: CombatLogParser,
  dataType: string,
  query: LegacyQuery,
): Promise<T> => {
  if (!owner.dataSource?.loadTable) {
    return Promise.reject(new AnalysisCapabilityUnavailableError(`${dataType} table data`));
  }
  return owner.dataSource.loadTable<T>({
    fightStart: query.start ?? owner.fight.start_time,
    fightEnd: query.end ?? owner.fight.end_time,
    dataType,
    playerId: query.actorid,
    filter: query.filter,
  });
};

export const loadParserEvents = (
  owner: CombatLogParser,
  dataType: string | undefined,
  query: LegacyQuery,
): Promise<{ events: AnyEvent[] }> => {
  const source = owner.dataSource;
  const method = query.filter ? source?.loadFilteredEvents : source?.loadEvents;
  if (!method) {
    return Promise.reject(new AnalysisCapabilityUnavailableError('filtered event data'));
  }
  const normalizedDataType = dataType
    ? dataType
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join('')
    : undefined;
  return method
    .call(source, {
      fightId: owner.fight.id,
      start: query.start ?? owner.fight.start_time,
      end: query.end ?? owner.fight.end_time,
      actorId: query.actorid,
      abilityId: query.abilityid,
      dataType: normalizedDataType,
      ...(query.filter ? { filter: query.filter } : {}),
    })
    .then((events) => ({ events }));
};
