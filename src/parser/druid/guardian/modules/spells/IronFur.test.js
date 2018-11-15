import SPELLS from 'common/SPELLS';
import { damageTaken, buffsApplied, SimpleFight } from 'parser/druid/guardian/test-fixtures/SimpleFight';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import IronFur from './IronFur';

describe('Core.IronFur', () => {
  let parser;
  let module;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    parser.selectedCombatant.traitsBySpellId = { [SPELLS.URSOCS_ENDURANCE.id]: 0 };
    module = parser.loadModule(IronFur);
  });
  it('track last ironfur time with noevents', () => {
    expect(module.overallIronfurUptime).toBe(0);
  });
  it('track physical hits under ironfur with only damage', () => {
    parser.processEvents(damageTaken);
    expect(module.hitsMitigated).toBe(0);
  });
  it('track physical hits with ironfur up with only ironfur', () => {
    parser.processEvents(buffsApplied);
    expect(module.hitsMitigated).toBe(0);
  });
  it('track physical hits while ironfur is up in a simple fight', () => {
    parser.processEvents(SimpleFight);
    expect(module.hitsMitigated).toBe(12);
  });
  it('track physical hits outside of ironfur in a simple fight', () => {
    parser.processEvents(SimpleFight);
    expect(module.hitsUnmitigated).toBe(3);
  });
});
