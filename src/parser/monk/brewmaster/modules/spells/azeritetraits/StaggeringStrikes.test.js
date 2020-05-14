import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';
import TestCombatLogParser from 'parser/core/tests/TestCombatLogParser';
import EventEmitter from 'parser/core/modules/EventEmitter';
import StaggeringStrikes from './StaggeringStrikes';
import StaggerFabricator from '../../core/StaggerFabricator';

const PLAYER = 1;
const ENEMY = 2;
const INITIAL_STAGGER = 25000;
const testEvents = [
  { timestamp: 0, type: EventType.Absorbed, sourceID: PLAYER, targetID: PLAYER, ability: { guid: SPELLS.STAGGER.id }, amount: INITIAL_STAGGER },
  { timestamp: 1000, type: EventType.Cast, sourceID: PLAYER, targetID: ENEMY, ability: { guid: SPELLS.BLACKOUT_STRIKE.id } },
  { timestamp: 4000, type: EventType.Cast, sourceID: PLAYER, targetID: ENEMY, ability: { guid: SPELLS.BLACKOUT_STRIKE.id } },
  { timestamp: 7000, type: EventType.Cast, sourceID: PLAYER, targetID: ENEMY, ability: { guid: SPELLS.BLACKOUT_STRIKE.id } },
  { timestamp: 10000, type: EventType.Cast, sourceID: PLAYER, targetID: ENEMY, ability: { guid: SPELLS.BLACKOUT_STRIKE.id } },
];

const overhealEvents = [
  ...testEvents,
  { timestamp: 13000, type: EventType.Cast, sourceID: PLAYER, targetID: ENEMY, ability: { guid: SPELLS.BLACKOUT_STRIKE.id }},
];

function bocCasts(events) {
  return events.filter(event => event.type === EventType.Cast && event.ability.guid === SPELLS.BLACKOUT_STRIKE.id).length;
}

const RANKS = [300, 325, 375];
const PER_CAST_REMOVAL = 1288 + 1638 + 2613;

describe('Brewmaster.Spells.AzeriteTraits.StaggeringStrikes', () => {
  let parser;
  let ss;
  beforeEach(() => {
    parser = new TestCombatLogParser();
    parser._combatant.hasTrait = () => true;
    parser._combatant.traitsBySpellId = {
      [SPELLS.STAGGERING_STRIKES.id]: RANKS,
    };
    const fab = parser.loadModule(StaggerFabricator, {
      eventEmitter: parser.getModule(EventEmitter),
    });
    ss = parser.loadModule(StaggeringStrikes, {
      fab,
    });
  });

  it('should correctly calculate stagger removed by BoS', () => {
    expect(ss._staggerReduction).toBe(PER_CAST_REMOVAL);
  });

  it('should count each BoS cast to determine total removed', () => {
    expect(ss._staggerRemoved).toBe(0);
    parser.processEvents(testEvents);
    expect(ss._staggerRemoved).toBe(bocCasts(testEvents) * PER_CAST_REMOVAL);
  });

  it('should correctly count overhealing', () => {
    expect(ss._staggerRemoved).toBe(0);
    parser.processEvents(overhealEvents);
    expect(ss._staggerRemoved).toBe(INITIAL_STAGGER);
    expect(ss._overhealing).toBe(bocCasts(overhealEvents) * PER_CAST_REMOVAL - INITIAL_STAGGER);
  });
});
