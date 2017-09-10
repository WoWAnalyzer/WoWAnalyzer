import Stagger from 'Parser/BrewmasterMonk/Modules/Core/Stagger';
import { processEvents } from './Fixtures/processEvents';
import { SimpleFight, EarlyFinish, incomingDamage } from './Fixtures/SimpleFight';

describe('Brewmaster.Stagger', () => {
  let stagger;
  beforeEach(() => {
    stagger = new Stagger({
      toPlayer: () => true,
      byPlayer: () => true,
    });
  });
  it('total amount of stagger taken with no events', () => {
    expect(stagger.totalStaggerTaken).toBe(0);
  });
  it('total amount of stagger taken with no stagger', () => {
    processEvents(incomingDamage, stagger);
    expect(stagger.totalStaggerTaken).toBe(0);
  });
  it('total amount of stagger damage taken', () => {
    processEvents(SimpleFight, stagger);
    expect(stagger.totalStaggerTaken).toBe(240);
  });
  it('track how much damage in total is absorbed by stagger, with no stagger absorbs', () => {
    processEvents(incomingDamage, stagger);
    expect(stagger.totalPhysicalStaggered + stagger.totalMagicalStaggered).toBe(0);
  });
  it('track how much damage in total is absorbed by stagger', () => {
    processEvents(SimpleFight, stagger);
    expect(stagger.totalPhysicalStaggered + stagger.totalMagicalStaggered).toBe(599);
  });
  it('track how much physical damage was staggered', () => {
    processEvents(SimpleFight, stagger);
    expect(stagger.totalPhysicalStaggered).toBe(300);
  });
  it('track how much magical damage was staggered', () => {
    processEvents(SimpleFight, stagger);
    expect(stagger.totalMagicalStaggered).toBe(299);
  });
  it('When was the last non stagger damage event', () => {
    processEvents(SimpleFight, stagger);
    expect(stagger.lastDamageEventNotStagger).toBe(5700);
  });
  it('Tracks the amount of stagger missing from the fight', () => {
    const earlyFightEnd = 6000;
    const myOwner = { fight: { end_time: earlyFightEnd } };
    processEvents(EarlyFinish, stagger);
    stagger.owner = myOwner;
    stagger.triggerEvent('finished');
    expect(stagger.staggerMissingFromFight).toBe(285);
  });
});
  

