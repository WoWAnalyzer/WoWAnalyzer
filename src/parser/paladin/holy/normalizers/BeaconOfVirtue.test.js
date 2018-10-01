import SPELLS from 'common/SPELLS';

import BeaconOfVirtue from './BeaconOfVirtue';

describe('Paladin/Holy/Normalizers/BeaconOfVirtue', () => {
  const reorderScenarios = [
    {
      it: 'doesn\'t move events that are already right',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'cast' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 2, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
        { testid: 4, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.FLASH_OF_LIGHT.id }, type: 'heal' },
      ],
      result: [1, 2, 3, 4],
    },
    {
      it: 'moves the applybuff right after the cast when misordered',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'cast' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.FLASH_OF_LIGHT.id }, type: 'heal' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
      ],
      result: [1, 3, 2],
    },
    {
      it: 'doesn\'t move an applybuff that is before the current cast',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'cast' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 2, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
        { testid: 4, timestamp: 1, sourceID: 1, targetID: 3, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
        { testid: 5, timestamp: 1, sourceID: 1, targetID: 4, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
      ],
      result: [1, 2, 3, 4, 5],
    },
    {
      it: 'accounts for the combatlog buffer time',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 99, sourceID: 1, targetID: null, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'cast' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.FLASH_OF_LIGHT.id }, type: 'heal' },
        { testid: 3, timestamp: 0, sourceID: 1, targetID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
      ],
      result: [1, 3, 2],
    },
    {
      it: 'ignores applybuff events that are not likely from the same cast',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, targetID: null, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'cast' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.FLASH_OF_LIGHT.id }, type: 'heal' },
        { testid: 3, timestamp: 200, sourceID: 1, targetID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
      ],
      result: [1, 2, 3],
    },
    {
      it: 're-orders multiple events properly',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'cast' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.FLASH_OF_LIGHT.id }, type: 'heal' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
        { testid: 4, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'cast' },
        { testid: 5, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.FLASH_OF_LIGHT.id }, type: 'heal' },
        { testid: 6, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
        { testid: 7, timestamp: 1, sourceID: 1, targetID: null, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'cast' },
        { testid: 8, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.FLASH_OF_LIGHT.id }, type: 'heal' },
        { testid: 9, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
      ],
      result: [1, 3, 2, 4, 6, 5, 7, 9, 8],
    },
    {
      it: 'only moves events of the same player',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'cast' },
        { testid: 2, timestamp: 0, sourceID: 1, targetID: 1, ability: { guid: SPELLS.FLASH_OF_LIGHT.id }, type: 'heal' },
        { testid: 3, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
        { testid: 4, timestamp: 0, sourceID: 2, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
      ],
      result: [1, 3, 2, 4],
    },
    {
      it: 'even moves when the event in-between is something irrelevant (it shouldn\'t know the difference)',
      events: [
        { testid: 1, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'cast' },
        // Both an irrelevant event and sourceID is different
        { testid: 2, timestamp: 0, sourceID: 2, targetID: 1, ability: { guid: SPELLS.FLASH_OF_LIGHT.id }, type: 'begincast' },
        { testid: 3, timestamp: 0, sourceID: 1, ability: { guid: SPELLS.BEACON_OF_VIRTUE_TALENT.id }, type: 'applybuff' },
      ],
      result: [1, 3, 2],
    },
  ];

  reorderScenarios.forEach(scenario => {
    it(scenario.it, () => {
      const parser = new BeaconOfVirtue();
      expect(parser.normalize(scenario.events).map(event => event.testid)).toEqual(scenario.result);
    });
  });
});
