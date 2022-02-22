import decompress from 'decompress';
import { wclGameVersionToExpansion } from 'game/VERSIONS';
import EventEmitter from 'parser/core/modules/EventEmitter';
import getConfig from 'parser/getConfig';

const _CACHE = {};

// asynchronously load and parse a log. returns a promise that resolves
// to the log object
export async function loadLog(filename) {
  if (_CACHE[filename] !== undefined) {
    return Promise.resolve(_CACHE[filename]);
  }
  const files = await decompress(filename);
  const result = files.reduce((res, file) => {
    res[file.path.split('.')[0]] = JSON.parse(file.data.toString());
    return res;
  }, {});

  _CACHE[filename] = result;
  return result;
}

/**
 * Suppress logging within the test.
 *
 * @param {boolean} log - Suppress console.log?
 * @param {boolean} warn - Suppress console.warn?
 * @param {boolean} error - Suppress console.error?
 */
export function suppressLogging(log, warn, error, cb) {
  const _console = {};
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

  Object.keys(_console).forEach((key) => {
    console[key] = _console[key];
  });
  return res;
}

export function parseLog(
  parserClass,
  log,
  build = undefined,
  suppressLog = true,
  suppressWarn = true,
) {
  const player = log.report.friendlies.find(({ id }) => id === log.meta.player.id);
  const fight = {
    ...log.report.fights.find(({ id }) => id === log.meta.fight.id),

    offset_time: 0,
  };
  const config = getConfig(
    wclGameVersionToExpansion(log.report.gameVersion),
    log.meta.player.specID,
    log.meta.player.type,
  );
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
    log.combatants.map((combatant) => ({
      ...combatant,
      player: log.report.friendlies.find((friendly) => friendly.id === combatant.sourceID),
    })),
    null,
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
