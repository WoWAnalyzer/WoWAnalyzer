import SPELLS from 'common/SPELLS';

import WildGrowth from './WildGrowth';

describe('RestoDruid/Modules/Normalizers/WildGrowth', () => {
  const reorderScenarios = [
    {
      // 0: simple test to see if the events aren't touched when they're already in order
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
        { testid: 2, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 3, timestamp: 1, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
      ],
      result: [1, 2, 3],
    },
    {
      // 1: test if the cast is moved before the applybuff
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 2, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
      ],
      result: [2, 1],
    },
    {
      // 2: test if the cast is moved before the applybuff when there's more events in the same tick
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: 'applybuff' },
        { testid: 2, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 3, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
        { testid: 4, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION_GERMINATION.id }, type: 'applybuff' },
      ],
      result: [1, 3, 2, 4],
    },
    {
      // 3: test if nothing is moved when the events are in other ticks
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 2, timestamp: 2, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
      ],
      result: [1, 2],
    },
    {
      // 4: test if the cast is moved before the applybuff when there's more events in other ticks
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: 'applybuff' },
        { testid: 2, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 3, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
        { testid: 4, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION_GERMINATION.id }, type: 'applybuff' },
      ],
      result: [1, 3, 2, 4],
    },
    {
      // 5: test if only the applybuff to the player is moved
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 2, timestamp: 1, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 3, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
      ],
      result: [2, 3, 1],
    },
    {
      // 6: test if it works for rejuv
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: 'applybuff' },
        { testid: 2, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: 'cast' },
      ],
      result: [2, 1],
    },
    {
      // 7: test if it works for rejuv germ
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION_GERMINATION.id }, type: 'applybuff' },
        { testid: 2, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: 'cast' },
      ],
      result: [2, 1],
    },
    {
      // 8: test if only the applybuff to the player is moved
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: 'applybuff' },
        { testid: 2, timestamp: 1, targetID: 2, ability: { guid: SPELLS.REJUVENATION.id }, type: 'cast' },
      ],
      result: [1, 2],
    },
    {
      // 9: test multiple reorderings
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 2, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
        { testid: 3, timestamp: 2, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 4, timestamp: 2, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
        { testid: 5, timestamp: 3, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 6, timestamp: 3, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
      ],
      result: [2, 1, 4, 3, 6, 5],
    },
    {
      // 10: test that WG and Flourish buffs are reordering correctly
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
        { testid: 2, timestamp: 1, targetID: null, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: 'cast' },
        { testid: 3, timestamp: 1, targetID: 1, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: 'applybuff' },
        { testid: 4, timestamp: 1, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 5, timestamp: 1, targetID: 3, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 6, timestamp: 1, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 7, timestamp: 1, targetID: 5, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
      ],
      result: [1, 4, 5, 6, 7,  2, 3],
    },
    {
      // 11: test that WG and Flourish buffs are reordering correctly #2
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
        { testid: 3, timestamp: 1, targetID: 1, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: 'applybuff' },
        { testid: 2, timestamp: 1, targetID: null, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: 'cast' },
        { testid: 4, timestamp: 1, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 5, timestamp: 1, targetID: 3, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 6, timestamp: 1, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 7, timestamp: 1, targetID: 5, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
      ],
      result: [1, 4, 5, 6, 7,  3, 2],
    },
    {
      // 12: test that WG and Flourish buffs are in order and no orderings are made
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'cast' },
        { testid: 4, timestamp: 1, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 5, timestamp: 1, targetID: 3, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 6, timestamp: 1, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 7, timestamp: 1, targetID: 5, ability: { guid: SPELLS.WILD_GROWTH.id }, type: 'applybuff' },
        { testid: 3, timestamp: 1, targetID: 1, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: 'applybuff' },
        { testid: 2, timestamp: 1, targetID: null, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: 'cast' },
      ],
      result: [1, 4, 5, 6, 7,  3, 2],
    },
  ];

  reorderScenarios.forEach((scenario, idx) => {
    it(`can reorder events ${idx}`, () => {
      const parser = new WildGrowth({
        owner: {
          playerId: scenario.playerId,
        },
      });
      expect(parser.normalize(scenario.events).map(event => event.testid)).toEqual(scenario.result);
    });
  });
});
