import SPELLS from 'common/SPELLS';
import CombatLogParser from 'Parser/HolyPaladin/CombatLogParser';

describe('HolyPaladin.CombatLogParser', () => {
  const reorderScenarios = [
    {
      test: 'doesn\'t re-order LoD when it\'s already in order',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: "cast" },
        { testid: 2, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 3, timestamp: 0, sourceID: 2, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
      ],
      result: [1, 2, 3],
    },
    {
      test: 'moves the cast before the heal when it\'s misordered',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 2, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: "cast" },
      ],
      result: [2, 1],
    },
    {
      test: 'ignores irrelevant spells',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 2, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.REJUVENATION.id }, type: "heal" },
        { testid: 3, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: "cast" },
        { testid: 4, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.REJUVENATION_GERMINATION.id }, type: "heal" },
      ],
      result: [2, 3, 1, 4],
    },
    {
      test: 'does not move more than 1 heal (this is assumed to be of a previous LoD)',
      events: [
        { testid: 1, timestamp: -5, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 2, timestamp: -5, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 3, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 4, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: "cast" },
      ],
      result: [1, 2, 4, 3],
    },
    {
      test: 'does not move heals that are too old (and likely from a previous LoD)',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 2, timestamp: 64, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: "cast" },
      ],
      result: [1, 2],
    },
    {
      test: 'only moves events of the same player',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 2, timestamp: 0, sourceID: 2, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 3, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: "cast" },
      ],
      result: [2, 3, 1],
    },
    {
      test: 'can move multiple around',
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 2, timestamp: 1, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: "cast" },
        { testid: 3, timestamp: 2, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 4, timestamp: 2, sourceID: 1, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: "cast" },
        { testid: 5, timestamp: 3, sourceID: 2, ability: { guid: SPELLS.LIGHT_OF_DAWN_HEAL.id }, type: "heal" },
        { testid: 6, timestamp: 3, sourceID: 2, ability: { guid: SPELLS.LIGHT_OF_DAWN_CAST.id }, type: "cast" },
      ],
      result: [2, 1, 4, 3, 6, 5],
    },
  ];

  reorderScenarios.forEach((scenario, idx) => {
    it(scenario.test, () => {
      const parser = new CombatLogParser();
      expect(parser.reorderEvents(scenario.events).map(event => event.testid)).toEqual(scenario.result);
    });
  });
});
