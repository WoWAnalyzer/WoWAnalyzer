import fs from 'fs';
import zlib from 'zlib';
import EventEmitter from 'parser/core/modules/EventEmitter';

const _CACHE = {};

export function loadLogSync(key, searchPath='test-logs/') {
  if(_CACHE[key] === undefined) {
    _CACHE[key] = JSON.parse(zlib.unzipSync(fs.readFileSync(`${searchPath}${key}.json.gz`)).toString());
  }
  return _CACHE[key];
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
      .forEach(key => console[key] = _console[key]);
  });
}

export function parseLog(parserClass, log) {
  const friendlies = log.meta.friendlies.find(({id}) => id === log.contents.player_id);
  const fight = log.meta.fights.find(({id}) => id === log.contents.fight_id);
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
