import { SimpleFight, incomingDamage } from 'parser/monk/brewmaster/test-fixtures/SimpleFight';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';

import IronSkinBrew from './IronSkinBrew';

const ENEMIES = {
  getEntities: () => { return {2: true}; },
};

describe('Brewmaster.IronskinBrew', () => {
  let parser;
  let module;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    module = parser.loadModule(IronSkinBrew, {
      enemies: ENEMIES,
      brews: {
        consumeCharge: () => {},
      },
    });
  });
  it('tracks the number of hits with the ironskin brew buff with no events', () => {
    expect(module.hitsWithIronSkinBrew).toBe(0);
  });
  it('tracks the number of hits with the ironskin brew buff with only damage', () => {
    parser.processEvents(incomingDamage, module);
    expect(module.hitsWithIronSkinBrew).toBe(0);
  });
  it('tracks the number of hits without the ironskin brew buff with only damage', () => {
    parser.processEvents(incomingDamage, module);
    expect(module.hitsWithoutIronSkinBrew).toBe(3);
  });
  it('Tracks the number of hits with the Ironskin Brew buff, when ', () => {
    parser.processEvents(SimpleFight, module);
    expect(module.hitsWithoutIronSkinBrew).toBe(1);
  });
  it('Tracks the numeber of hits without the Ironskin Brew buff', () => {
    parser.processEvents(SimpleFight, module);
    expect(module.hitsWithIronSkinBrew).toBe(2);
  });
});
