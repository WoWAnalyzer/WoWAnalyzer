import fs from 'fs';
import zlib from 'zlib';
import EventEmitter from 'parser/core/modules/EventEmitter';
import decompress from 'decompress';

const _CACHE = {};

// asynchronously load and parse a log. returns a promise that resolves
// to the log object
export function loadLog(key, searchPath='test-logs/') {
  if(_CACHE[key] !== undefined) {
    return Promise.resolve(_CACHE[key]);
  }
  return decompress(`${searchPath}${key}.zip`).then(files => {
    const result = files.reduce((res, file) => {
      res[file.path.split('.')[0]] = JSON.parse(file.data.toString());
      return res;
    }, {});

    _CACHE[key] = result;
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
export function suppressLogging(log, warn, error) {
  const _console = {};
  beforeEach(() => {
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
  });

  afterEach(() => {
    Object.keys(_console)
      .forEach(key => { console[key] = _console[key]; });
  });
}

export function parseLog(parserClass, log) {
  const friendlies = log.meta.friendlies.find(({id}) => id === log.content_ids.player_id);
  const fight = log.meta.fights.find(({id}) => id === log.content_ids.fight_id);
  const parser = new parserClass(
    log.meta, 
    friendlies,
    fight,
    log.combatants
  );
  log.events.forEach(event => parser.getModule(EventEmitter).triggerEvent(event));
  parser.finish();
  return parser;
}
