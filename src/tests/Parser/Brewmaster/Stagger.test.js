import Stagger from 'Parser/BrewmasterMonk/Modules/Core/Stagger';
import { events, processEvents, FIGHT_END, TOTAL_STAGGERED } from './SimpleFight';

describe('Core.Stagger', () => {
  it('Test total stagger taken', () => {
    const stagger = new Stagger();
    processEvents(events, stagger);
    expect(stagger.totalStaggerTaken).toBe(TOTAL_STAGGERED);
  });
  it('Test stagger end fight', () => {
    const myOwner = {fight: {end_time: FIGHT_END}}
    const stagger = new Stagger();
    stagger.owner = myOwner;
    expect(stagger.owner.fight.end_time).toBe(FIGHT_END);
  });
  it('Test absorbed', () => {
    const stagger = new Stagger();
    processEvents(events, stagger);
    expect(stagger.totalPhysicalStaggered + stagger.totalMagicalStaggered).toBe(599);
  });
  it('Test Physical staggers', () => {
    const stagger = new Stagger();
    processEvents(events, stagger);
    expect(stagger.totalPhysicalStaggered).toBe(300);
  });
  it('Test time of last non-stagger event', () => {
    const stagger = new Stagger();
    processEvents(events, stagger);
    expect(stagger.lastDamageEventNotStagger).toBe(5700);
  });
  it('Test on_finished after stagger ran out', () => {
    const myOwner = {fight: {end_time: FIGHT_END}}
    const stagger = new Stagger();
    processEvents(events, stagger);
    stagger.owner = myOwner;
    stagger.on_finished();
    expect(stagger.staggerMissingFromFight).toBe(130);
  });
  it('Test on_finished before stagger ran out', () => {
    const earlyFightEnd = 6000;
    const myOwner = {fight: {end_time: earlyFightEnd}}
    const stagger = new Stagger();
    processEvents(events, stagger, earlyFightEnd);
    stagger.owner = myOwner;
    stagger.on_finished();
    expect(stagger.staggerMissingFromFight).toBe(285);
  });
});
  

