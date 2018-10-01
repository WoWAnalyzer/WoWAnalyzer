import SPELLS from 'common/SPELLS';

import LightOfDawn from './LightOfDawn';

describe('Paladin/Holy/Normalizers/LightOfDawn', () => {
  const reorderScenarios = [
    {
      it: 'doesn\'t move events that are already right',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 2, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
      ],
      result: [1, 2, 3],
    },
    {
      it: 'moves the cast before the heal when misordered',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
      ],
      result: [2, 1],
    },
    {
      it: 'moves the cast before the heal where there\'s multiple heals',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 2, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 4, timestamp: 1, sourceID: 1, targetID: 3, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 5, timestamp: 1, sourceID: 1, targetID: 4, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
      ],
      result: [2, 1, 3, 4, 5],
    },
    {
      it: 'accounts for the combatlog buffer time', // e.g. 83ms in report/XdVPajNB8vpJkyCF/16-Mythic+Antoran+High+Command+-+Kill+(7:17)/177/events
      playerId: 1,
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 99, sourceID: 1, targetID: null, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
      ],
      result: [2, 1],
    },
    {
      it: 'ignores events that are likely from other LoD casts (e.g. in the case of a Divine Purpose proc)',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 200, sourceID: 1, targetID: null, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
      ],
      result: [1, 2],
    },
    {
      it: 'ignores events from other players, and still re-orders',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 1, sourceID: 2, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
      ],
      result: [2, 3, 1],
    },
    {
      it: 'only moves one event (the same LoD cast can\'t heal the same person twice)',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
      ],
      result: [1, 3, 2],
    },
    {
      it: 're-orders multiple events properly',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
        { testid: 3, timestamp: 2, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 4, timestamp: 2, sourceID: 1, targetID: null, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
        { testid: 5, timestamp: 3, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 6, timestamp: 3, sourceID: 1, targetID: null, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
      ],
      result: [2, 1, 4, 3, 6, 5],
    },

    // Ok so apperently I wrote this whole test before finding out there was already a test but it was in a weird location. Well I cba figuring out which tests are duplicated, so here are all the test cases!
    {
      it: 'doesn\'t re-order LoD when it\'s already in order',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
        { testid: 2, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 3, timestamp: 0, sourceID: 2, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
      ],
      result: [1, 2, 3],
    },
    {
      it: 'moves the cast before the heal when it\'s misordered',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
      ],
      result: [2, 1],
    },
    {
      it: 'ignores irrelevant spells',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: 'heal' },
        { testid: 3, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
        { testid: 4, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.REJUVENATION_GERMINATION.id }, type: 'heal' },
      ],
      result: [2, 3, 1, 4],
    },
    {
      it: 'does not move more than 1 heal (this is assumed to be of a previous LoD)',
      events: [
        { testid: 1, timestamp: -5, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: -5, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 3, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 4, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
      ],
      result: [1, 2, 4, 3],
    },
    {
      it: 'does not move heals that are too old (and likely from a previous LoD)',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 264, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
      ],
      result: [1, 2],
    },
    {
      it: 'only moves events of the same player',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 0, sourceID: 2, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 3, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
      ],
      result: [2, 3, 1],
    },
    {
      it: 'can move multiple around',
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 2, timestamp: 1, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
        { testid: 3, timestamp: 2, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 4, timestamp: 2, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
        { testid: 5, timestamp: 3, sourceID: 2, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: 'heal' },
        { testid: 6, timestamp: 3, sourceID: 2, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: 'cast' },
      ],
      result: [2, 1, 4, 3, 6, 5],
    },
  ];

  reorderScenarios.forEach(scenario => {
    it(scenario.it, () => {
      const parser = new LightOfDawn({
        playerId: scenario.playerId,
      });
      expect(parser.normalize(scenario.events).map(event => event.testid)).toEqual(scenario.result);
    });
  });
});
