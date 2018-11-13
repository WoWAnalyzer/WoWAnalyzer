import SPELLS from 'common/SPELLS';
import { EarlyFinish, incomingDamage, SimpleFight } from 'parser/monk/brewmaster/test-fixtures/SimpleFight';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';
import EventEmitter from 'parser/core/modules/EventEmitter';

import StaggerFabricator from './StaggerFabricator';
import Stagger from './Stagger';

describe('Brewmaster.Stagger', () => {
  let parser;
  let module;
  let fab;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    parser.selectedCombatant.traitsBySpellId = { [SPELLS.STAGGERING_AROUND.id]: 0 };
    fab = parser.loadModule('staggerFabricator', StaggerFabricator, {
      eventEmitter: parser.getModule(EventEmitter),
    });
    module = parser.loadModule('stagger', Stagger, {
      fab,
    });
  });
  it('total amount of stagger taken with no events', () => {
    expect(module.totalStaggerTaken).toBe(0);
  });
  it('total amount of stagger taken with no stagger', () => {
    parser.processEvents(incomingDamage, fab, module);
    expect(module.totalStaggerTaken).toBe(0);
  });
  it('total amount of stagger damage taken', () => {
    parser.processEvents(SimpleFight, fab, module);
    expect(module.totalStaggerTaken).toBe(240);
  });
  it('track how much damage in total is absorbed by stagger, with no stagger absorbs', () => {
    parser.processEvents(incomingDamage, fab, module);
    expect(module.totalPhysicalStaggered + module.totalMagicalStaggered).toBe(0);
  });
  it('track how much damage in total is absorbed by stagger', () => {
    parser.processEvents(SimpleFight, fab, module);
    expect(module.totalPhysicalStaggered + module.totalMagicalStaggered).toBe(599);
  });
  it('track how much physical damage was staggered', () => {
    parser.processEvents(SimpleFight, fab, module);
    expect(module.totalPhysicalStaggered).toBe(300);
  });
  it('track how much magical damage was staggered', () => {
    parser.processEvents(SimpleFight, fab, module);
    expect(module.totalMagicalStaggered).toBe(299);
  });
  it('Tracks the amount of stagger missing from the fight', () => {
    parser.processEvents(EarlyFinish, fab, module);
    parser.triggerEvent({
      type: 'finished',
    });
    expect(module.staggerMissingFromFight).toBe(484);
  });
});
