import SPELLS from 'common/SPELLS';
import { SimpleFight } from 'tests/Parser/Brewmaster/Fixtures/SimpleFight';
import TestCombatLogParser from 'tests/TestCombatLogParser';

import StaggerFabricator from '../Core/StaggerFabricator';
import T20_4pc from './T20_4pc';

describe('Brewmaster.T20_4pc', () => {
  let parser;
  let item;
  let fab;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    parser.selectedCombatant.traitsBySpellId = { [SPELLS.STAGGERING_AROUND.id]: 0 };
    fab = new StaggerFabricator(parser);
    item = new T20_4pc(parser);
    item.fab = fab;
    fab._hasTier20_4pc = true;
  });
  it('how many gift of the ox orbs were absorbed as a heal', () => {
    parser.processEvents(SimpleFight);
    expect(item.orbsEaten).toBe(1);
  });
  it('how much stagger was reduced by absorbing the gift of the ox orbs', () => {
    parser.processEvents(SimpleFight);
    expect(item.staggerSaved).toBe(23.450000000000003);
  });
});
