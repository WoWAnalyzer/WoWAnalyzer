import EventOrderNormalizer from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';

function fakeEvent(abilityId, type, timestamp, sourceID, targetID) {
  return {
    ability: { guid: abilityId },
    type,
    timestamp,
    sourceID,
    targetID,
  };
}

class ConcreteEventOrderNormalizer extends EventOrderNormalizer {
  // eslint-disable-next-line no-useless-constructor
  constructor(options, eventOrders) {
    super(options, eventOrders);
  }
}

/**
 * Listing of tests as specified by a 'test' object with fields:
 * @param it describes test
 * @param eventOrders the event orders specification to pass to EventOrdersNormalizer
 * @param events the events to normalize
 * @param resultOrder the expected order of the normalized events as specified by their original index
 * @param additionalChecks OPTIONAL a function which performs additional checks on the output,
 *     is passed the original events array, the results events array, and must return true iff it passes the check
 */
const tests = [
  {
    it: 'two out of order events should be reordered',
    eventOrders: [
      {
        beforeEventId: 20,
        beforeEventType: EventType.ApplyBuff,
        afterEventId: 15,
        afterEventType: EventType.Heal,
      },
    ],
    events: [
      fakeEvent(15, EventType.Heal, 100, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 100, 1, 2),
    ],
    resultOrder: [1, 0],
    additionalChecks: (before, after) => after[1].__reordered === true && !after[0].__reordered,
  },
  {
    it: 'only exactly specified events should be reordered',
    eventOrders: [
      {
        beforeEventId: 20,
        beforeEventType: EventType.ApplyBuff,
        afterEventId: 15,
        afterEventType: EventType.Heal,
      },
    ],
    events: [
      // pair already in correct order - shouldn't be moved
      fakeEvent(20, EventType.ApplyBuff, 100, 1, 2), // 0
      fakeEvent(15, EventType.Heal, 100, 1, 2), // 1
      // before eventID no match - shouldn't be moved
      fakeEvent(15, EventType.Heal, 200, 1, 2), // 2
      fakeEvent(21, EventType.ApplyBuff, 200, 1, 2), // 3
      // after eventID no match - shouldn't be moved
      fakeEvent(16, EventType.Heal, 300, 1, 2), // 4
      fakeEvent(20, EventType.ApplyBuff, 300, 1, 2), // 5
      // before event type no match - shouldn't be moved
      fakeEvent(15, EventType.Heal, 400, 1, 2), // 6
      fakeEvent(20, EventType.RemoveBuff, 400, 1, 2), // 7
      // after event type no match - shouldn't be moved
      fakeEvent(15, EventType.Damage, 500, 1, 2), // 8
      fakeEvent(20, EventType.ApplyBuff, 500, 1, 2), // 9
      // sourceID no match - shouldn't be moved
      fakeEvent(15, EventType.Heal, 700, 2, 2), // 10
      fakeEvent(20, EventType.ApplyBuff, 700, 1, 2), // 11
      // targetID no match - shouldn't be moved
      fakeEvent(15, EventType.Heal, 700, 1, 2), // 12
      fakeEvent(20, EventType.ApplyBuff, 700, 1, 3), // 13
      // all match, but out of timestamp range - shouldn't be moved
      fakeEvent(15, EventType.Heal, 599, 1, 2), // 14
      fakeEvent(20, EventType.ApplyBuff, 600, 1, 2), // 15
      // should be moved!
      fakeEvent(15, EventType.Heal, 700, 1, 2), // 16
      fakeEvent(20, EventType.ApplyBuff, 700, 1, 2), // 17
      // also should be moved, test it can iterate over intermediate events
      fakeEvent(15, EventType.Heal, 800, 1, 2), // 18
      fakeEvent(1, EventType.Damage, 800, 1, 2), // 19
      fakeEvent(2, EventType.Damage, 800, 1, 2), // 20
      fakeEvent(3, EventType.Damage, 800, 1, 2), // 21
      fakeEvent(4, EventType.Damage, 800, 1, 2), // 22
      fakeEvent(20, EventType.ApplyBuff, 800, 1, 2), // 23
    ],
    resultOrder: [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      17, //
      16, // first reorder
      19,
      20,
      21,
      22,
      23, //
      18, // second reorder - event pushed infront without touching intermediate events
    ],
  },
  {
    it: 'multiple event orders should be followed',
    eventOrders: [
      {
        beforeEventId: 20,
        beforeEventType: EventType.ApplyBuff,
        afterEventId: 15,
        afterEventType: EventType.Heal,
      },
      {
        beforeEventId: 30,
        beforeEventType: EventType.ApplyDebuff,
        afterEventId: 25,
        afterEventType: EventType.Damage,
      },
    ],
    events: [
      fakeEvent(25, EventType.Damage, 100, 1, 3),
      fakeEvent(15, EventType.Heal, 100, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 100, 1, 2),
      fakeEvent(30, EventType.ApplyDebuff, 100, 1, 3),
    ],
    resultOrder: [2, 1, 3, 0],
  },
  {
    it: 'triple ordering should work',
    eventOrders: [
      {
        beforeEventId: 1,
        beforeEventType: EventType.Cast,
        afterEventId: 2,
        afterEventType: EventType.ApplyBuff,
      },
      {
        beforeEventId: 2,
        beforeEventType: EventType.ApplyBuff,
        afterEventId: 3,
        afterEventType: EventType.Heal,
      },
    ],
    events: [
      fakeEvent(3, EventType.Heal, 100, 1, 1),
      fakeEvent(2, EventType.ApplyBuff, 100, 1, 1),
      fakeEvent(1, EventType.Cast, 100, 1, 1),
    ],
    resultOrder: [2, 1, 0],
  },
  {
    it: 'eventID list should be followed',
    eventOrders: [
      {
        beforeEventId: 20,
        beforeEventType: EventType.ApplyBuff,
        afterEventId: [15, 16, 17],
        afterEventType: EventType.Heal,
      },
    ],
    events: [
      // matches id
      fakeEvent(15, EventType.Heal, 100, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 100, 1, 2),
      // matches id
      fakeEvent(16, EventType.Heal, 200, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 200, 1, 2),
      // matches id
      fakeEvent(17, EventType.Heal, 300, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 300, 1, 2),
      // doesn't match
      fakeEvent(18, EventType.Heal, 400, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 400, 1, 2),
    ],
    resultOrder: [1, 0, 3, 2, 5, 4, 6, 7],
  },
  {
    it: 'eventID null should be followed',
    eventOrders: [
      {
        beforeEventId: 50,
        beforeEventType: EventType.ApplyBuff,
        afterEventId: null,
        afterEventType: EventType.ResourceChange,
      },
    ],
    events: [
      // matches any ID
      fakeEvent(1337, EventType.ResourceChange, 100, 1, 1),
      fakeEvent(50, EventType.ApplyBuff, 100, 1, 1),
      // matches any ID
      fakeEvent(1, EventType.ResourceChange, 200, 1, 1),
      fakeEvent(50, EventType.ApplyBuff, 200, 1, 1),
      // even an undefined ID!
      fakeEvent(undefined, EventType.ResourceChange, 300, 1, 1),
      fakeEvent(50, EventType.ApplyBuff, 300, 1, 1),
      // still needs to match type - won't swap
      fakeEvent(1337, EventType.Damage, 400, 1, 1),
      fakeEvent(50, EventType.ApplyBuff, 400, 1, 1),
    ],
    resultOrder: [1, 0, 3, 2, 5, 4, 6, 7],
  },
  {
    it: 'event type list should be followed',
    eventOrders: [
      {
        beforeEventId: 20,
        beforeEventType: [EventType.ApplyBuff, EventType.RefreshBuff],
        afterEventId: 15,
        afterEventType: EventType.Heal,
      },
    ],
    events: [
      // matches type
      fakeEvent(15, EventType.Heal, 100, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 100, 1, 2),
      // matches type
      fakeEvent(15, EventType.Heal, 200, 1, 2),
      fakeEvent(20, EventType.RefreshBuff, 200, 1, 2),
      // doesn't match
      fakeEvent(15, EventType.Heal, 300, 1, 2),
      fakeEvent(20, EventType.RemoveBuff, 300, 1, 2),
    ],
    resultOrder: [1, 0, 3, 2, 4, 5],
  },
  {
    it: 'bufferMs option should work',
    eventOrders: [
      {
        beforeEventId: 20,
        beforeEventType: EventType.ApplyBuff,
        afterEventId: 15,
        afterEventType: EventType.Heal,
        bufferMs: 50,
      },
    ],
    events: [
      // in range for swap
      fakeEvent(15, EventType.Heal, 100, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 100, 1, 2),
      // in range for swap
      fakeEvent(15, EventType.Heal, 190, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 200, 1, 2),
      // in range for swap
      fakeEvent(15, EventType.Heal, 250, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 300, 1, 2),
      // out of range for swap
      fakeEvent(15, EventType.Heal, 330, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 400, 1, 2),
    ],
    resultOrder: [1, 0, 3, 2, 5, 4, 6, 7],
  },
  {
    it: 'anySource option should work',
    eventOrders: [
      {
        beforeEventId: 20,
        beforeEventType: EventType.ApplyBuff,
        afterEventId: 15,
        afterEventType: EventType.Heal,
        anySource: true,
      },
    ],
    events: [
      // all same, should swap
      fakeEvent(15, EventType.Heal, 100, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 100, 1, 2),
      // different source, should swap
      fakeEvent(15, EventType.Heal, 200, 2, 2),
      fakeEvent(20, EventType.ApplyBuff, 200, 1, 2),
      // undefined source, should swap
      fakeEvent(15, EventType.Heal, 200, undefined, 2),
      fakeEvent(20, EventType.ApplyBuff, 200, undefined, 2),
      // different target, shouldn't swap
      fakeEvent(15, EventType.Heal, 300, 1, 3),
      fakeEvent(20, EventType.ApplyBuff, 300, 1, 2),
    ],
    resultOrder: [1, 0, 3, 2, 5, 4, 6, 7],
  },
  {
    it: 'anyTarget option should work',
    eventOrders: [
      {
        beforeEventId: 20,
        beforeEventType: EventType.ApplyBuff,
        afterEventId: 15,
        afterEventType: EventType.Heal,
        anyTarget: true,
      },
    ],
    events: [
      // all same, should swap
      fakeEvent(15, EventType.Heal, 100, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 100, 1, 2),
      // different source, shouldn't swap
      fakeEvent(15, EventType.Heal, 200, 2, 2),
      fakeEvent(20, EventType.ApplyBuff, 200, 1, 2),
      // different target, should swap
      fakeEvent(15, EventType.Heal, 300, 1, 3),
      fakeEvent(20, EventType.ApplyBuff, 300, 1, 2),
      // undefined target, should swap
      fakeEvent(15, EventType.Heal, 300, 1, undefined),
      fakeEvent(20, EventType.ApplyBuff, 300, 1, undefined),
    ],
    resultOrder: [1, 0, 2, 3, 5, 4, 7, 6],
  },
  {
    it: 'updateTimestamp should work',
    eventOrders: [
      {
        beforeEventId: 20,
        beforeEventType: EventType.ApplyBuff,
        afterEventId: 15,
        afterEventType: EventType.Heal,
        bufferMs: 50,
        updateTimestamp: true,
      },
    ],
    events: [
      fakeEvent(15, EventType.Heal, 50, 1, 2),
      fakeEvent(20, EventType.ApplyBuff, 100, 1, 2),
    ],
    resultOrder: [1, 0],
    additionalChecks: (before, after) => after[1].timestamp === 100,
  },
];

// runs all the tests described above
describe('EventOrderNormalizer unit tests', () => {
  tests.forEach((test) => {
    it(test.it, () => {
      const parser = new ConcreteEventOrderNormalizer({}, test.eventOrders);

      // mark events with their original index
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < test.events.length; i++) {
        test.events[i].__testId = i;
      }
      const before = JSON.parse(JSON.stringify(test.events)); // deep copy so 'before' events aren't modified
      const after = parser.normalize(test.events);
      //      console.log("Events Before: ");
      //      console.log(before);
      //      console.log("Events After: ");
      //      console.log(after);
      expect(after.map((e) => e.__testId)).toEqual(test.resultOrder);
      if (test.additionalChecks) {
        expect(test.additionalChecks(before, after)).toEqual(true);
      }
    });
  });
});
