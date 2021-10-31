import { ResourceChangeEvent, EventType } from 'parser/core/Events';

import resourceGained from './resourceGained';

const energizeEvent = (id: number, amount: number = 100): ResourceChangeEvent => ({
  type: EventType.ResourceChange,
  ability: {
    guid: id,
    name: 'test',
    type: 1,
    abilityIcon: 'test',
  },
  sourceID: 1,
  sourceIsFriendly: true,
  targetID: 1,
  targetIsFriendly: true,
  timestamp: 0,
  resourceChangeType: 0,
  resourceChange: amount,
  waste: 0,
  otherResourceChange: 0,
  resourceActor: 1, // this is unused, so a random value should suffice
  classResources: [],
  hitPoints: 100,
  maxHitPoints: 100,
  attackPower: 0,
  spellPower: 0,
  x: 0,
  y: 0,
  facing: 0,
  armor: 0,
  mapID: 0,
  itemLevel: 0,
});

describe('resourceGained', () => {
  it('starts empty', () => {
    expect(resourceGained([])).toEqual({});
  });
  it('tracks energizes', () => {
    expect(resourceGained([energizeEvent(1)])).toEqual({
      1: {
        0: {
          1: 100,
        },
      },
    });
    expect(resourceGained([energizeEvent(3)])).toEqual({
      1: {
        0: {
          3: 100,
        },
      },
    });
    expect(resourceGained([energizeEvent(1), energizeEvent(3)])).toEqual({
      1: {
        0: {
          1: 100,
          3: 100,
        },
      },
    });
    expect(
      resourceGained([
        energizeEvent(1),
        energizeEvent(3),
        { ...energizeEvent(4), resourceChangeType: 2 },
      ]),
    ).toEqual({
      1: {
        0: {
          1: 100,
          3: 100,
        },
        2: {
          4: 100,
        },
      },
    });
  });
  it('adds up multiple events', () => {
    expect(resourceGained([energizeEvent(1), energizeEvent(1, 25)])).toEqual({
      1: {
        0: {
          1: 125,
        },
      },
    });
  });
  it('does not include wasted resources', () => {
    expect(
      resourceGained([
        {
          ...energizeEvent(1),
          resourceChange: 100,
          waste: 50,
        },
      ]),
    ).toEqual({
      1: {
        0: {
          1: 50,
        },
      },
    });
  });
  it("tracks other player's resource changes", () => {
    expect(
      resourceGained([
        {
          ...energizeEvent(1),
          sourceID: 1,
          targetID: 2,
        },
      ]),
    ).toEqual({
      2: {
        0: {
          1: 100,
        },
      },
    });
  });
});
