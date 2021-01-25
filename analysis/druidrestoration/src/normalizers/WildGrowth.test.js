import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import WildGrowth from './WildGrowth';

describe('RestoDruid/Modules/Normalizers/WildGrowth', () => {
  const reorderScenarios = [
    {
      // 0: simple test to see if the events aren't touched when they're already in order
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 2, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 3, timestamp: 1, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
      ],
      result: [1, 2, 3],
    },
    {
      // 1: test if the cast is moved before the applybuff
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
      ],
      result: [2, 1],
    },
    {
      // 2: test if the cast is moved before the applybuff when there's more events in the same tick
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 3, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 4, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION_GERMINATION.id }, type: EventType.ApplyBuff },
      ],
      result: [1, 3, 2, 4],
    },
    {
      // 3: test if nothing is moved when the events are in other ticks
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 200, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 3, timestamp: 200, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
      ],
      result: [1, 2, 3],
    },
    {
      // 4: test if the cast is moved before the applybuff when there's more events in other ticks
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 3, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 4, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION_GERMINATION.id }, type: EventType.ApplyBuff },
      ],
      result: [1, 3, 2, 4],
    },
    {
      // 5: test if only the applybuff to the player is moved
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 3, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
      ],
      result: [2, 3, 1],
    },
    {
      // 6: test if it works for rejuv
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: EventType.Cast },
      ],
      result: [2, 1],
    },
    {
      // 7: test if it works for rejuv germ
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION_GERMINATION.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: EventType.Cast },
      ],
      result: [2, 1],
    },
    {
      // 8: test if only the applybuff to the player is moved
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, targetID: 2, ability: { guid: SPELLS.REJUVENATION.id }, type: EventType.Cast },
      ],
      result: [1, 2],
    },
    {
      // 9: test multiple reorderings
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 7, timestamp: 1, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 3, timestamp: 200, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 4, timestamp: 200, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 5, timestamp: 400, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 6, timestamp: 400, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
      ],
      result: [2, 1, 7, 4, 3, 6, 5],
    },
    {
      // 10: test that WG and Flourish buffs are reordering correctly
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 2, timestamp: 1, targetID: null, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.Cast },
        { testid: 3, timestamp: 1, targetID: 1, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.ApplyBuff },
        { testid: 4, timestamp: 1, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 5, timestamp: 1, targetID: 3, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 6, timestamp: 1, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 7, timestamp: 1, targetID: 5, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
      ],
      result: [1, 4, 5, 6, 7, 2, 3],
    },
    {
      // 11: test that WG and Flourish buffs are reordering correctly #2
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 3, timestamp: 1, targetID: 1, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, targetID: null, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.Cast },
        { testid: 4, timestamp: 1, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 5, timestamp: 1, targetID: 3, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 6, timestamp: 1, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 7, timestamp: 1, targetID: 5, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
      ],
      result: [1, 4, 5, 6, 7, 3, 2],
    },
    {
      // 12: test that WG and Flourish buffs are in order and no orderings are made
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 4, timestamp: 1, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 5, timestamp: 1, targetID: 3, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 6, timestamp: 1, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 7, timestamp: 1, targetID: 5, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 3, timestamp: 1, targetID: 1, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, targetID: null, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.Cast },
      ],
      result: [1, 4, 5, 6, 7, 3, 2],
    },
    {
      // 13: https://i.gyazo.com/a1c62ca9ff8a99637b81cf8270a2e26d.png
      playerId: 1,
      events: [
        { testid: 1, timestamp: 501, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 2, timestamp: 501, targetID: null, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.Cast },
        { testid: 3, timestamp: 501, targetID: 1, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.ApplyBuff },
        { testid: 4, timestamp: 501, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 5, timestamp: 501, targetID: 3, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 6, timestamp: 520, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 7, timestamp: 520, targetID: 5, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 8, timestamp: 1050, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 9, timestamp: 1050, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 10, timestamp: 1050, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
      ],
      result: [1, 4, 5, 6, 7, 2, 3, 8, 9,10],
    },
    {
      // 14: https://i.gyazo.com/c56935a68bd6d87c0cc9306dccd8d665.png
      playerId: 1,
      events: [
        { testid: 1, timestamp: 90, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 105, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 3, timestamp: 105, targetID: null, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.Cast },
        { testid: 4, timestamp: 105, targetID: 1, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.ApplyBuff },
        { testid: 5, timestamp: 105, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 6, timestamp: 119, targetID: 3, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 7, timestamp: 119, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 8, timestamp: 119, targetID: 5, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
      ],
      result: [2, 1, 5, 6, 7, 8, 3, 4],
    },
    {
      // 15: https://i.gyazo.com/572fa84b3a00b14ae66ca1201f511190.png
      playerId: 1,
      events: [
        { testid: 1, timestamp: 781, targetID: 1, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 781, targetID: null, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.Cast },
        { testid: 3, timestamp: 781, targetID: 2, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 4, timestamp: 781, targetID: 3, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 5, timestamp: 781, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 6, timestamp: 799, targetID: 5, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 7, timestamp: 799, targetID: 6, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 8, timestamp: 934, targetID: null, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.Cast },
        { testid: 9, timestamp: 934, targetID: 1, ability: { guid: SPELLS.FLOURISH_TALENT.id }, type: EventType.ApplyBuff },
        { testid: 10, timestamp: 2000, targetID: 4, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
        { testid: 11, timestamp: 2000, targetID: 5, ability: { guid: SPELLS.WILD_GROWTH.id }, type: EventType.ApplyBuff },
      ],
      result: [2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11],
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
