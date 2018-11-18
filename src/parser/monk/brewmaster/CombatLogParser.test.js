import CombatLogParser from './CombatLogParser';
import EventEmitter from 'parser/core/modules/EventEmitter';

import fs from 'fs';
import zlib from 'zlib';

const FIGHT_ID = 12;
const PLAYER_ID = 3;

describe('The Brewmaster Analyzer', () => {
  let report;
  let combatantInfoEvents;
  let events; 
  beforeAll(() => {
    report = JSON.parse(fs.readFileSync(__dirname + '/test-fixtures/example/meta.json').toString());
    combatantInfoEvents = JSON.parse(fs.readFileSync(__dirname + '/test-fixtures/example/combatant-info.json').toString()).events;
    events = JSON.parse(zlib.unzipSync(fs.readFileSync(__dirname + '/test-fixtures/example/events.json.gz')).toString()).events;
  });

  let _console = {};
  beforeEach(() => {
    _console.warn = console.warn;
    _console.log = console.log;
    console.log = () => undefined;
    console.warn = () => undefined;
  });

  afterEach(() => {
    console.log = _console.log;
    console.warn = _console.warn;
  });

  it('should parse the example report without crashing', () => {
    const parser = new CombatLogParser(report, report.friendlies[PLAYER_ID], report.fights[FIGHT_ID], combatantInfoEvents);
    events.forEach(event => parser.getModule(EventEmitter).triggerEvent(event));
  });
});
