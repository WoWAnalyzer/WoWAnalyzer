import Stagger from 'Parser/BrewmasterMonk/Modules/Core/Stagger';
import { events, processEvents, FIGHT_END, TOTAL_STAGGERED } from './Fixtures/SimpleFight';

const stagger = new Stagger();

describe('Brewmaster.Stagger', () => {
  beforeAll(() => {
    processEvents(events, stagger);
  });
  it('Total amount of stagger damage taken', () => {
    expect(stagger.totalStaggerTaken).toBe(240);
  });
  it('Ensure the end of fight is handled correctly', () => {
    const myOwner = {fight: {end_time: FIGHT_END}}
    const staggerLocal = new Stagger();
    staggerLocal.owner = myOwner;
    expect(staggerLocal.owner.fight.end_time).toBe(FIGHT_END);
  });
  it('How much damage in total is absorbed by stagger', () => {
    expect(stagger.totalPhysicalStaggered + stagger.totalMagicalStaggered).toBe(599);
  });
  it('How much physical damage was staggered', () => {
    expect(stagger.totalPhysicalStaggered).toBe(300);
  });
  it('When was the last non stagger damage event', () => {
    expect(stagger.lastDamageEventNotStagger).toBe(5700);
  });
  it('Test that stagger is correctly reduced by the fight ending before the last tick', () => {
    const earlyFightEnd = 6000;
    const myOwner = {fight: {end_time: earlyFightEnd}}
    const staggerLocal = new Stagger();
    processEvents(events, staggerLocal, earlyFightEnd);
    staggerLocal.owner = myOwner;
    staggerLocal.on_finished();
    expect(staggerLocal.staggerMissingFromFight).toBe(285);
  });
});
  

