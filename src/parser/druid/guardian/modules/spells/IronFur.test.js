import SPELLS from 'common/SPELLS';
import { damageTaken, buffsApplied, SimpleFight } from 'tests/parser/guardian/fixtures/SimpleFight';
import TestCombatLogParser from 'tests/TestCombatLogParser';

import IronFur from './IronFur';

describe('Core.IronFur', () => {
  let parser;
  let ironfur;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    parser.selectedCombatant.traitsBySpellId = { [SPELLS.URSOCS_ENDURANCE.id]: 0 };
    ironfur = new IronFur(parser);
  });
  it('track last ironfur time with noevents', () => {
    expect(ironfur.overallIronfurUptime).toBe(0);
  });
  it('track physical hits under ironfur with only damage', () => {
    parser.processEvents(damageTaken);
    expect(ironfur.hitsMitigated).toBe(0);
  });
  it('track physical hits with ironfur up with only ironfur', () => {
    parser.processEvents(buffsApplied);
    expect(ironfur.hitsMitigated).toBe(0);
  });
  it('track physical hits while ironfur is up in a simple fight', () => {
    parser.processEvents(SimpleFight);
    expect(ironfur.hitsMitigated).toBe(12);
  });
  it('track physical hits outside of ironfur in a simple fight', () => {
    parser.processEvents(SimpleFight);
    expect(ironfur.hitsUnmitigated).toBe(3);
  });
});
