import decompress from 'decompress';
import { wclGameVersionToExpansion } from 'game/VERSIONS';
import EventEmitter from 'parser/core/modules/EventEmitter';
import getConfig from 'parser/getConfig';
import CombatLogParser from 'parser/core/CombatLogParser';
import CharacterProfile from 'parser/core/CharacterProfile';
import { CombatantInfoEvent } from 'parser/core/Events';
import { PlayerInfo } from 'parser/core/Player';
import { WCLFight } from 'parser/core/Fight';

const _CACHE: Record<string, Record<string, any>> = {};

// asynchronously load and parse a log. returns a promise that resolves
// to the log object
export async function loadLog(filename: string) {
  if (_CACHE[filename] !== undefined) {
    return Promise.resolve(_CACHE[filename]);
  }
  const initialResult: Record<string, any> = {};
  const files = await decompress(filename);
  const result = files.reduce((res, file) => {
    res[file.path.split('.')[0]] = JSON.parse(file.data.toString());
    return res;
  }, initialResult);

  _CACHE[filename] = result;
  return result;
}

/**
 * Suppress logging within the test.
 *
 * @param {boolean} log - Suppress console.log?
 * @param {boolean} warn - Suppress console.warn?
 * @param {boolean} error - Suppress console.error?
 * @param {function} cb - Callback
 */
export function suppressLogging(log: boolean, warn: boolean, error: boolean, cb: () => any) {
  const _console: {
    warn?: typeof console.warn;
    log?: typeof console.log;
    error?: typeof console.error;
  } = {};
  if (warn) {
    _console.warn = console.warn;
    console.warn = () => undefined;
  }
  if (log) {
    _console.log = console.log;
    console.log = () => undefined;
  }
  if (error) {
    _console.error = console.error;
    console.error = () => undefined;
  }

  const res = cb();

  (Object.keys(_console) as Array<keyof typeof _console>).forEach((key) => {
    const _consoleValue = _console[key];
    if (_consoleValue) {
      console[key] = _consoleValue;
    }
  });
  return res;
}

export function parseLog(
  parserClass: typeof CombatLogParser,
  log: Record<string, any>,
  build: string | undefined = undefined,
  suppressLog = true,
  suppressWarn = true,
) {
  const player = log.report.friendlies.find(({ id }: PlayerInfo) => id === log.meta.player.id);
  const fight = {
    ...log.report.fights.find(({ id }: WCLFight) => id === log.meta.fight.id),

    offset_time: 0,
  };
  const config = getConfig(
    wclGameVersionToExpansion(log.report.gameVersion),
    log.meta.player.specID,
    log.meta.player.type,
  );
  if (!config) {
    throw new Error('Unable to get Config for selected report/player combination');
  }
  const builds = config.builds;
  const buildKey = builds && Object.keys(builds).find((b) => builds[b].url === build);
  builds &&
    Object.keys(builds).forEach((key) => {
      builds[key].active = key === buildKey;
    });
  const parser = new parserClass(
    config,
    {
      ...log.report,
      code: log.meta.reportCode || 'TEST',
    },
    player,
    fight,
    log.combatants.map((combatant: CombatantInfoEvent) => ({
      ...combatant,
      player: log.report.friendlies.find(
        (friendly: PlayerInfo) => friendly.id === combatant.sourceID,
      ),
    })),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {} as CharacterProfile,
    build,
  );
  return suppressLogging(suppressLog, suppressWarn, false, () => {
    parser
      .normalize(JSON.parse(JSON.stringify(log.events)))
      .forEach((event) => parser.getModule(EventEmitter).triggerEvent(event));
    parser.finish();
    return parser;
  });
}
