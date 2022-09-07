import {
  EarlyFinish,
  incomingDamage,
  SimpleFight,
} from 'analysis/retail/monk/brewmaster/test-fixtures/SimpleFight';
import EventEmitter from 'parser/core/modules/EventEmitter';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';
import FightEnd from 'parser/shared/normalizers/FightEnd';

import Stagger from './Stagger';
import StaggerFabricator from './StaggerFabricator';

describe('Brewmaster.Stagger', () => {
  let parser;
  let eventEmitter;
  let module;
  let fab;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    eventEmitter = parser.getModule(EventEmitter);
    fab = parser.loadModule(StaggerFabricator, {
      eventEmitter,
    });
    module = parser.loadModule(Stagger, {
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
    parser.loadModule(FightEnd);
    const normalized = parser.normalize(EarlyFinish); // Because fight end is now normalized
    parser.processEvents(normalized, fab, module);
    expect(module.staggerMissingFromFight).toBe(484);
  });
});
