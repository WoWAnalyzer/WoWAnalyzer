import IronSkinBrew from 'Parser/BrewmasterMonk/Modules/Spells/IronSkinBrew';
import { events, processEvents, TOTAL_STAGGERED } from './Fixtures/SimpleFight';

const isb = new IronSkinBrew();

describe('Brewmaster.IronskinBrew', () => {
  beforeAll(() => {
    processEvents(events, isb);
  });
  it('How many times the player was hit without having Ironskin Brew up', () => {
    expect(isb.hitsWithoutIronSkinBrew).toBe(1);
  });
  it('How many times was hte player with with Ironskin Brew', () => {
    expect(isb.hitsWithIronSkinBrew).toBe(2);
  });
  // should be the same as the stagger test
  it('Total amount of stagger damage taken', () => {
    expect(isb.staggerDot).toBe(TOTAL_STAGGERED);
  });
});
  

