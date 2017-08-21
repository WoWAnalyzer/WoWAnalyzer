import IronSkinBrew from 'Parser/BrewmasterMonk/Modules/Spells/IronSkinBrew';
import { events, processEvents, TOTAL_STAGGERED } from './SimpleFight';

describe('Spells.IronskinBrew', () => {
  it('Test hits without Ironskin Brew', () => {
    const item = new IronSkinBrew();
    processEvents(events, item);
    expect(item.hitsWithoutIronSkinBrew).toBe(1);
  });
  it('Test hits with Ironskin Brew', () => {
    const item = new IronSkinBrew();
    processEvents(events, item);
    expect(item.hitsWithIronSkinBrew).toBe(2);
  });
  // should be the same as the stagger test
  it('Test staggerDot', () => {
    const item = new IronSkinBrew();
    processEvents(events, item);
    expect(item.staggerDot).toBe(TOTAL_STAGGERED);
  });
});
  

