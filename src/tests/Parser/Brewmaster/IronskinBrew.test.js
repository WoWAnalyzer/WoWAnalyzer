import IronSkinBrew from 'Parser/Monk/Brewmaster/Modules/Spells/IronSkinBrew';
import processEvents from './Fixtures/processEvents';
import { SimpleFight, incomingDamage } from './Fixtures/SimpleFight';

const ENEMIES = {
  getEntities: () => { return {2: true}; },
};

describe('Brewmaster.IronskinBrew', () => {
  let isb;
  beforeEach(() => {
    isb = new IronSkinBrew({
      toPlayer: () => true,
      byPlayer: () => true,
      toPlayerPet: () => false,
      byPlayerPet: () => false,
    });
    isb.enemies = ENEMIES;
    isb.brews = {
      consumeCharge: () => {},
    };
  });
  it('tracks the number of hits with the ironskin brew buff with no events', () => {
    expect(isb.hitsWithIronSkinBrew).toBe(0);
  });
  it('tracks the number of hits with the ironskin brew buff with only damage', () => {
    processEvents(incomingDamage, isb);
    expect(isb.hitsWithIronSkinBrew).toBe(0);
  });
  it('tracks the number of hits without the ironskin brew buff with only damage', () => {
    processEvents(incomingDamage, isb);
    expect(isb.hitsWithoutIronSkinBrew).toBe(3);
  });
  it('Tracks the number of hits with the Ironskin Brew buff, when ', () => {
    processEvents(SimpleFight, isb);
    expect(isb.hitsWithoutIronSkinBrew).toBe(1);
  });
  it('Tracks the numeber of hits without the Ironskin Brew buff', () => {
    processEvents(SimpleFight, isb);
    expect(isb.hitsWithIronSkinBrew).toBe(2);
  });
});
