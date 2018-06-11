import SPELLS from 'common/SPELLS';

import RakeBleed from './RakeBleed';

describe('Druid/Feral/Normalizers/RakeBleed', () => {
  const reorderScenarios = [
    {
      it: 'moves applydebuff after cast',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [2, 1],
    },
    {
      it: 'moves refreshdebuff after cast',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'refreshdebuff' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [2, 1],
    },
    {
      it: 'doesn\'t move events that are already in the correct order',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
      ],
      result: [1, 2],
    },
    {
      it: 'doesn\'t move events when there\'s no matching debuff event',
      playerId: 1,
      events: [
        // wrong spellId
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RIP.id }, type: 'applydebuff' },
        // wrong source
        { testid: 2, timestamp: 1, sourceID: 2, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [1, 2, 3],
    },
    {
      it: 'doesn\'t move events that are already correct, despite cast noise between them',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.SHRED.id }, type: 'cast' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
      ],
      result: [1, 2, 3],
    },
    {
      it: 'doesn\'t move events that are already correct, despite debuff noise between them',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RIP.id }, type: 'applydebuff' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
      ],
      result: [1, 2, 3],
    },
    {
      it: 'corrects order despite an unrelated cast event between them',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.SHRED.id }, type: 'cast' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [2, 3, 1],
    },
    {
      it: 'corrects order despite an unrelated debuff event between them',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RIP.id }, type: 'applydebuff' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [2, 3, 1],
    },
    {
      it: 'moves just the closest debuff event when there\'s multiple before the cast',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [1, 3, 2],
    },
    {
      it: 'reorders when there\'s a small difference in timestamp',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 2, timestamp: 20, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [2, 1],
    },
    {
      it: 'doesn\'t move events when timestamp difference is large',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 2, timestamp: 2000, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [1, 2],
    },
    {
      it: 'doesn\'t move events when they are from different sources',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 2, timestamp: 1, sourceID: 2, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [1, 2],
    },
    {
      it: 'doesn\'t move events when they have different targetIDs',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 2, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [1, 2],
    },
    { // e.g. on a fight like Defence of Eonar where many enemies have the same targetID but different targetInstance values
      it: 'doesn\'t move events when they have different targetsInstance values',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, targetInstance: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 2, timestamp: 1, sourceID: 1, targetID: 1, targetInstance: 2, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [1, 2],
    },
    { // debuff from A, debuff from B, cast from A, cast from B
      it: 'moves events when two players are acting at the same time and both need normalizing',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 2, timestamp: 1, sourceID: 2, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
        { testid: 4, timestamp: 1, sourceID: 2, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
      ],
      result: [3, 1, 4, 2],
    },
    { // debuff from A, cast from B, cast from A, debuff from B
      it: 'moves only the necessary event when two players are acting at the same time but only one needs normalizing',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 2, timestamp: 1, sourceID: 2, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
        { testid: 4, timestamp: 1, sourceID: 2, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
      ],
      result: [2, 3, 1, 4],
    },
    { // cast from A, cast from B, debuff from A, debuff from B
      it: 'doesn\'t move events when two players are acting at the same time and neither need normalizing',
      playerId: 1,
      events: [
        { testid: 1, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
        { testid: 2, timestamp: 1, sourceID: 2, targetID: 1, ability: { guid: SPELLS.RAKE.id }, type: 'cast' },
        { testid: 3, timestamp: 1, sourceID: 1, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
        { testid: 4, timestamp: 1, sourceID: 2, targetID: 1, ability: { guid: SPELLS.RAKE_BLEED.id }, type: 'applydebuff' },
      ],
      result: [1, 2, 3, 4],
    },
  ];
  reorderScenarios.forEach(scenario => {
    it(scenario.it, () => {
      const parser = new RakeBleed();
      expect(parser.normalize(scenario.events).map(event => event.testid)).toEqual(scenario.result);
    });
  });
});
