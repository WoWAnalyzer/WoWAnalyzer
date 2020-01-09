import decompress from 'decompress';

import EventEmitter from 'parser/core/modules/EventEmitter';
import ConfigLoader from 'interface/report/ConfigLoader';

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

  Object.keys(_console).forEach(key => {
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
  const friendlies = log.report.friendlies.find(
    ({ id }) => id === log.meta.player.id,
  );
  const fight = {
    ...log.report.fights.find(({ id }) => id === log.meta.fight.id),
    offset_time: 0,
  };
  const builds = ConfigLoader.getConfig(log.meta.player.specID).builds;
  const buildKey =
    builds && Object.keys(builds).find(b => builds[b].url === build);
  builds &&
    Object.keys(builds).forEach(key => {
      builds[key].active = key === buildKey;
    });
  const parser = new parserClass(
    {
      ...log.report,
      code: log.meta.reportCode || 'TEST',
    },
    friendlies,
    fight,
    log.combatants,
    null,
    build,
    builds,
  );
  return suppressLogging(suppressLog, suppressWarn, false, () => {
    parser
      .normalize(JSON.parse(JSON.stringify(log.events)))
      .forEach(event => parser.getModule(EventEmitter).triggerEvent(event));
    parser.finish();
    return parser;
  });
}
