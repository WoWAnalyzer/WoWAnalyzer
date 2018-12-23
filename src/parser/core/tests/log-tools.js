import EventEmitter from 'parser/core/modules/EventEmitter';
import decompress from 'decompress';

const _CACHE = {};

// asynchronously load and parse a log. returns a promise that resolves
// to the log object
export function loadLog(filename, searchPath='test-logs/') {
  if(_CACHE[filename] !== undefined) {
    return Promise.resolve(_CACHE[filename]);
  }
  return decompress(`${searchPath}${filename}.zip`).then(files => {
    const result = files.reduce((res, file) => {
      res[file.path.split('.')[0]] = JSON.parse(file.data.toString());
      return res;
    }, {});

    _CACHE[filename] = result;
    return result;
  });
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
  if(warn) {
    _console.warn = console.warn;
    console.warn = () => undefined;
  }
  if(log) {
    _console.log = console.log;
    console.log = () => undefined;
  }
  if(error) {
    _console.error = console.error;
    console.error = () => undefined;
  }

  const res = cb();

  Object.keys(_console)
    .forEach(key => { console[key] = _console[key]; });
  return res;
}

export function parseLog(parserClass, log) {
  const friendlies = log.report.friendlies.find(({id}) => id === log.meta.player.id);
  const fight = log.report.fights.find(({id}) => id === log.meta.fight.id);
  const parser = new parserClass(
    log.report, 
    friendlies,
    fight,
    log.combatants
  );
  return suppressLogging(true, true, false, () => {
    parser.normalize(JSON.parse(JSON.stringify(log.events))).forEach(event => parser.getModule(EventEmitter).triggerEvent(event));
    parser.finish();
    return parser;
  });
}
