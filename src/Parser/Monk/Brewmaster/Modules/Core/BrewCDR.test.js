// naming & location of this test file is for ease of location, there is
// a web of modules needed for this test so we are just loading up
// everything here
import zlib from 'zlib';
import fs from 'fs';
import CombatLogParser from '../../CombatLogParser'; 
import BrewCDR from './BrewCDR';
import report from '../../test-logs/report_nxzcqJKmYwHbdWMp';

// Disable spammy warnings
console.error = jest.fn();
console.warn = jest.fn();

describe.skip('BrewCDR', () => {
  let events;
  let parser;

  beforeAll(() => {
    const buff = fs.readFileSync(__dirname + "/../../test-logs/eisenpelz_felhounds_h_nxzcqJKmYwHbdWMp.json.gz");
    events = JSON.parse(zlib.unzipSync(buff).toString()).events;
    parser = new CombatLogParser(
      report,
      report.friendlies.find(player => player.name === "Eisenpelz"),
      [],
      report.fights.find(fight => fight.id === 8)
    );
    parser.initialize(events.filter(ev => ev.type === "combatantinfo"));
    parser.parseEvents(events);
  });

  it("should contain an active BrewCDR module", () => {
    expect(parser.findModule(BrewCDR).active).toBe(true);
  });

  it("should report 427.09s of CDR", () => {
    expect(Math.round(parser.findModule(BrewCDR).totalCDR)).toBe(451469);
  });
});
