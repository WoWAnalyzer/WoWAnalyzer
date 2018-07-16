import { SimpleFight, incomingDamage } from 'tests/Parser/Brewmaster/Fixtures/SimpleFight';
import TestCombatLogParser from 'tests/TestCombatLogParser';

import IronSkinBrew from './IronSkinBrew';

const ENEMIES = {
  getEntities: () => { return {2: true}; },
};

describe('Brewmaster.IronskinBrew', () => {
  let parser;
  let isb;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    isb = new IronSkinBrew(parser);
    isb.enemies = ENEMIES;
    isb.brews = {
      consumeCharge: () => {},
    };
  });
  it('tracks the number of hits with the ironskin brew buff with no events', () => {
    expect(isb.hitsWithIronSkinBrew).toBe(0);
  });
  it('tracks the number of hits with the ironskin brew buff with only damage', () => {
    parser.processEvents(incomingDamage, isb);
    expect(isb.hitsWithIronSkinBrew).toBe(0);
  });
  it('tracks the number of hits without the ironskin brew buff with only damage', () => {
    parser.processEvents(incomingDamage, isb);
    expect(isb.hitsWithoutIronSkinBrew).toBe(3);
  });
  it('Tracks the number of hits with the Ironskin Brew buff, when ', () => {
    parser.processEvents(SimpleFight, isb);
    expect(isb.hitsWithoutIronSkinBrew).toBe(1);
  });
  it('Tracks the numeber of hits without the Ironskin Brew buff', () => {
    parser.processEvents(SimpleFight, isb);
    expect(isb.hitsWithIronSkinBrew).toBe(2);
  });
});
