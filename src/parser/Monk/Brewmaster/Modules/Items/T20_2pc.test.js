import { SimpleFight } from 'tests/parser/brewmaster/fixtures/SimpleFight';
import TestCombatLogParser from 'tests/TestCombatLogParser';
import GiftOfTheOx from '../normalizers/GiftOfTheOx';

import T20_2pc from './T20_2pc';

describe('Brewmaster.T20_2pc', () => {
  let parser;
  let item;
  let gotox;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    gotox = new GiftOfTheOx(parser);
    item = new T20_2pc(parser);
  });
  it('tracks the number of orbs spawned by the T202pc', () => {
    parser.processEvents(gotox.normalize(SimpleFight));
    expect(item.orbTriggeredBy2Pc).toBe(1);
  });
  it('tracks how many brews were used, each has a 40% chance to spawn an orb', () => {
    parser.processEvents(gotox.normalize(SimpleFight));
    expect(item.brewCount).toBe(2);
  });
});

