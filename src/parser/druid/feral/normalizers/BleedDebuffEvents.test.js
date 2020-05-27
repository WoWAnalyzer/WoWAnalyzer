import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

import BleedDebuffEvents from './BleedDebuffEvents';

describe('Druid/Feral/Normalizers/BleedDebuffEvents', () => {
  /**
   * The expected result is listing what testid should be in each event's debuffEvents property.
   * null means the event shouldn't have a debuffEvents property at all, if the event should be
   * given an empty debuffEvents that's shown as empty array []
   */
  const scenarios = [
    {
      it: 'creates debuffEvents array with one matched applydebuff',
      events: [
        { testid: 1, timestamp: 1, ability: { guid: SPELLS.RAKE.id }, type: EventType.Cast },
        { testid: 2, timestamp: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: EventType.ApplyDebuff },
      ],
      result: [
        [2],
        null,
      ],
    },
    {
      it: 'creates debuffEvents array with one matched refreshdebuff',
      events: [
        { testid: 1, timestamp: 1, ability: { guid: SPELLS.RAKE.id }, type: EventType.Cast },
        { testid: 2, timestamp: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: EventType.RefreshDebuff },
      ],
      result: [
        [2],
        null,
      ],
    },
    {
      it: 'skips over mismatched applydebuff events',
      events: [
        { testid: 1, timestamp: 1, ability: { guid: SPELLS.RAKE.id }, type: EventType.Cast },
        { testid: 2, timestamp: 1, ability: { guid: SPELLS.RIP.id }, type: EventType.ApplyDebuff },
        { testid: 3, timestamp: 1, ability: { guid: SPELLS.MOONFIRE_BEAR.id }, type: EventType.ApplyDebuff },
        { testid: 4, timestamp: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: EventType.ApplyDebuff },
      ],
      result: [
        [4],
        null,
        null,
        null,
      ],
    },
    {
      it: 'skips over damage events',
      events: [
        { testid: 1, timestamp: 1, ability: { guid: SPELLS.RAKE.id }, type: EventType.Cast },
        { testid: 2, timestamp: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: EventType.Damage },
        { testid: 3, timestamp: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: EventType.ApplyDebuff },
      ],
      result: [
        [3],
        null,
        null,
      ],
    },
    {
      it: 'copes when there\'s no matching debuff events',
      events: [
        { testid: 1, timestamp: 1, ability: { guid: SPELLS.RAKE.id }, type: EventType.Cast },
        { testid: 2, timestamp: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: EventType.Damage },
        { testid: 3, timestamp: 1, ability: { guid: SPELLS.RIP.id }, type: EventType.ApplyDebuff },
      ],
      result: [
        [],
        null,
        null,
      ],
    },

    {
      it: 'ignores debuff events too far in the future',
      events: [
        { testid: 1, timestamp: 1, ability: { guid: SPELLS.RAKE.id }, type: EventType.Cast },
        { testid: 2, timestamp: 10000, ability: { guid: SPELLS.RIP.id }, type: EventType.ApplyDebuff },
      ],
      result: [
        [],
        null,
      ],
    },
    {
      it: 'handles abilities which create multiple debuffs',
      events: [
        { testid: 1, timestamp: 1, ability: { guid: SPELLS.THRASH_FERAL.id }, type: EventType.Cast },
        { testid: 2, timestamp: 1, ability: { guid: SPELLS.THRASH_FERAL.id }, type: EventType.ApplyDebuff },
        { testid: 3, timestamp: 1, ability: { guid: SPELLS.THRASH_FERAL.id }, type: EventType.ApplyDebuff },
        { testid: 4, timestamp: 1, ability: { guid: SPELLS.THRASH_FERAL.id }, type: EventType.ApplyDebuff },
      ],
      result: [
        [2, 3, 4],
        null,
        null,
        null,
      ],
    },
    {
      it: 'ignores multiple debuffs on abilities meant to only create one',
      events: [
        { testid: 1, timestamp: 1, ability: { guid: SPELLS.RAKE.id }, type: EventType.Cast },
        { testid: 2, timestamp: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: EventType.ApplyDebuff },
        { testid: 3, timestamp: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: EventType.ApplyDebuff },
        { testid: 4, timestamp: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: EventType.ApplyDebuff },
      ],
      result: [
        [2],
        null,
        null,
        null,
      ],
    },
  ];

  scenarios.forEach(scenario => {
    it(scenario.it, () => {
      const parser = new BleedDebuffEvents({});
      expect(parser.normalize(scenario.events).map(event => (
        event.debuffEvents ?
          event.debuffEvents.map(linkedEvent => (
            linkedEvent.testid
          ))
         : null
      ))).toEqual(scenario.result);
    });
  });
});
