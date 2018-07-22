import { SimpleFight } from 'tests/Parser/Brewmaster/Fixtures/SimpleFight';
import TestCombatLogParser from 'tests/TestCombatLogParser';

import T20_2pc from './T20_2pc';

describe('Brewmaster.T20_2pc', () => {
  let parser;
  let item;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    item = new T20_2pc(parser);
  });
  it('tracks the number of orbs spawned by the T202pc', () => {
    parser.processEvents(SimpleFight);
    expect(item.orbTriggeredBy2Pc).toBe(1);
  });
  it('tracks how many brews were used, each has a 40% chance to spawn an orb', () => {
    parser.processEvents(SimpleFight);
    expect(item.brewCount).toBe(2);
  });
});

