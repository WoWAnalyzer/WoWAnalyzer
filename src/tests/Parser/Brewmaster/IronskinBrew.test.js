import IronSkinBrew from 'Parser/BrewmasterMonk/Modules/Spells/IronSkinBrew';
import { events, processEvents } from './Fixtures/SimpleFight';

let isb = null;

describe('Brewmaster.IronskinBrew', () => {
  beforeEach(() => {
    isb = new IronSkinBrew();
    processEvents(events, isb);
  });
  it('How many times the player was hit without having Ironskin Brew up', () => {
    expect(isb.hitsWithoutIronSkinBrew).toBe(1);
  });
  it('How many times was hte player with with Ironskin Brew', () => {
    expect(isb.hitsWithIronSkinBrew).toBe(2);
  });
});
