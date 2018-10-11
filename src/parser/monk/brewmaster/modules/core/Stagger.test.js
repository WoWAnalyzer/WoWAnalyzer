import SPELLS from 'common/SPELLS';
import { EarlyFinish, incomingDamage, SimpleFight } from 'parser/monk/brewmaster/test-fixtures/SimpleFight';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import StaggerFabricator from './StaggerFabricator';
import Stagger from './Stagger';

describe('Brewmaster.Stagger', () => {
  let parser;
  let stagger;
  let fab;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    parser.selectedCombatant.traitsBySpellId = { [SPELLS.STAGGERING_AROUND.id]: 0 };
    fab = new StaggerFabricator({ owner: parser });
    stagger = new Stagger({ owner: parser });
    stagger.fab = fab;
  });
  it('total amount of stagger taken with no events', () => {
    expect(stagger.totalStaggerTaken).toBe(0);
  });
  it('total amount of stagger taken with no stagger', () => {
    parser.processEvents(incomingDamage, fab, stagger);
    expect(stagger.totalStaggerTaken).toBe(0);
  });
  it('total amount of stagger damage taken', () => {
    parser.processEvents(SimpleFight, fab, stagger);
    expect(stagger.totalStaggerTaken).toBe(240);
  });
  it('track how much damage in total is absorbed by stagger, with no stagger absorbs', () => {
    parser.processEvents(incomingDamage, fab, stagger);
    expect(stagger.totalPhysicalStaggered + stagger.totalMagicalStaggered).toBe(0);
  });
  it('track how much damage in total is absorbed by stagger', () => {
    parser.processEvents(SimpleFight, fab, stagger);
    expect(stagger.totalPhysicalStaggered + stagger.totalMagicalStaggered).toBe(599);
  });
  it('track how much physical damage was staggered', () => {
    parser.processEvents(SimpleFight, fab, stagger);
    expect(stagger.totalPhysicalStaggered).toBe(300);
  });
  it('track how much magical damage was staggered', () => {
    parser.processEvents(SimpleFight, fab, stagger);
    expect(stagger.totalMagicalStaggered).toBe(299);
  });
  it('Tracks the amount of stagger missing from the fight', () => {
    parser.processEvents(EarlyFinish, fab, stagger);
    parser.triggerEvent({
      type: 'finished',
    });
    expect(stagger.staggerMissingFromFight).toBe(484);
  });
});
