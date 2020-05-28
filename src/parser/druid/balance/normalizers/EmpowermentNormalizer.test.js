import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';
import LunarEmpowermentNormalizer from './LunarEmpowermentNormalizer';

describe('Druid/Balance/Normalizers/EmpowermentNormalizer', () => {
  const reorderScenarios = [
    {
      it: 'moves applybuff after cast',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LUNAR_EMP_BUFF.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.STARSURGE_MOONKIN.id }, type: EventType.Cast },
      ],
      result: [2, 1],
    },
    {
      it: 'moves applybuffstack after cast',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LUNAR_EMP_BUFF.id }, type: EventType.ApplyBuffStack },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.STARSURGE_MOONKIN.id }, type: EventType.Cast },
      ],
      result: [2, 1],
    },
    {
      it: 'only moves the closest if there are multiple applybuffs',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LUNAR_EMP_BUFF.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LUNAR_EMP_BUFF.id }, type: EventType.ApplyBuff },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.STARSURGE_MOONKIN.id }, type: EventType.Cast },
      ],
      result: [1, 3, 2],
    },
    {
      it: 'only moves the closest if there are both an applybuff and an applybuffstack',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LUNAR_EMP_BUFF.id }, type: EventType.ApplyBuff },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.LUNAR_EMP_BUFF.id }, type: EventType.ApplyBuffStack },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.STARSURGE_MOONKIN.id }, type: EventType.Cast },
      ],
      result: [1, 3, 2],
    },
  ];
  reorderScenarios.forEach(scenario => {
    it(scenario.it, () => {
      const parser = new LunarEmpowermentNormalizer({});
      expect(parser.normalize(scenario.events).map(event => event.testid)).toEqual(scenario.result);
    });
  });
});
