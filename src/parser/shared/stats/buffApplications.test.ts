import {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  EventType,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';

import buffApplications from './buffApplications';

const applyBuffEvent = (spellId: number, others?: Partial<ApplyBuffEvent>): ApplyBuffEvent => ({
  type: EventType.ApplyBuff,
  ability: {
    guid: spellId,
    name: 'test',
    type: 1,
    abilityIcon: 'test',
  },
  sourceID: 1,
  sourceIsFriendly: true,
  targetID: 2,
  targetIsFriendly: false,
  timestamp: 0,
  ...others,
});
const removeBuffEvent = (spellId: number, others?: Partial<RemoveBuffEvent>): RemoveBuffEvent => ({
  type: EventType.RemoveBuff,
  ability: {
    guid: spellId,
    name: 'test',
    type: 1,
    abilityIcon: 'test',
  },
  sourceID: 1,
  sourceIsFriendly: true,
  targetID: 2,
  targetIsFriendly: false,
  timestamp: 0,
  ...others,
});
const applyDebuffEvent = (
  spellId: number,
  others?: Partial<ApplyDebuffEvent>,
): ApplyDebuffEvent => ({
  type: EventType.ApplyDebuff,
  ability: {
    guid: spellId,
    name: 'test',
    type: 1,
    abilityIcon: 'test',
  },
  sourceID: 1,
  sourceIsFriendly: true,
  targetID: 2,
  targetIsFriendly: false,
  timestamp: 0,
  ...others,
});
const removeDebuffEvent = (
  spellId: number,
  others?: Partial<RemoveDebuffEvent>,
): RemoveDebuffEvent => ({
  type: EventType.RemoveDebuff,
  ability: {
    guid: spellId,
    name: 'test',
    type: 1,
    abilityIcon: 'test',
  },
  sourceID: 1,
  sourceIsFriendly: true,
  targetID: 2,
  targetIsFriendly: false,
  timestamp: 0,
  ...others,
});

describe('buffApplications', () => {
  it('starts empty', () => {
    expect(buffApplications([])).toEqual({});
  });
  it('tracks buff applications', () => {
    expect(buffApplications([applyBuffEvent(1)])).toEqual({
      1: {
        1: [
          {
            start: 0,
            end: undefined,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
    });
    expect(buffApplications([applyBuffEvent(3)])).toEqual({
      3: {
        1: [
          {
            start: 0,
            end: undefined,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
    });
    expect(buffApplications([applyBuffEvent(1), applyBuffEvent(3)])).toEqual({
      1: {
        1: [
          {
            start: 0,
            end: undefined,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
      3: {
        1: [
          {
            start: 0,
            end: undefined,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
    });
    expect(
      buffApplications([
        applyBuffEvent(1),
        applyBuffEvent(3, { timestamp: 1 }),
        applyBuffEvent(3, { timestamp: 2, targetID: 3 }),
        applyBuffEvent(3, { timestamp: 3, targetInstance: 2 }),
        applyBuffEvent(1, { timestamp: 4 }),
        applyBuffEvent(3, { timestamp: 5 }),
      ]),
    ).toEqual({
      1: {
        1: [
          {
            start: 0,
            end: undefined,
            targetId: 2,
            targetInstance: undefined,
          },
          {
            start: 4,
            end: undefined,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
      3: {
        1: [
          {
            start: 1,
            end: undefined,
            targetId: 2,
            targetInstance: undefined,
          },
          {
            start: 2,
            end: undefined,
            targetId: 3,
            targetInstance: undefined,
          },
          {
            start: 3,
            end: undefined,
            targetId: 2,
            targetInstance: 2,
          },
          {
            start: 5,
            end: undefined,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
    });
  });
  it("tracks other player's buff applications", () => {
    expect(
      buffApplications([
        applyBuffEvent(1),
        {
          ...applyBuffEvent(1),
          sourceID: 2,
          targetID: 1,
        },
      ]),
    ).toEqual({
      1: {
        1: [
          {
            start: 0,
            end: undefined,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
        2: [
          {
            start: 0,
            end: undefined,
            targetId: 1,
            targetInstance: undefined,
          },
        ],
      },
    });
  });
  it('updates instances on removal', () => {
    expect(buffApplications([applyBuffEvent(1), removeBuffEvent(1, { timestamp: 2 })])).toEqual({
      1: {
        1: [
          {
            start: 0,
            end: 2,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
    });
    expect(
      buffApplications([
        applyBuffEvent(1),
        applyBuffEvent(3, { timestamp: 1 }),
        removeBuffEvent(1, { timestamp: 2 }),
        removeBuffEvent(3, { timestamp: 3 }),
      ]),
    ).toEqual({
      1: {
        1: [
          {
            start: 0,
            end: 2,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
      3: {
        1: [
          {
            start: 1,
            end: 3,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
    });
  });
  it('updates the instance with the same target', () => {
    expect(
      buffApplications([
        applyBuffEvent(1),
        {
          ...applyBuffEvent(1, { timestamp: 1 }),
          targetID: 3,
        },
        removeBuffEvent(1, { timestamp: 6 }),
      ]),
    ).toEqual({
      1: {
        1: [
          {
            start: 0,
            end: 6,
            targetId: 2,
            targetInstance: undefined,
          },
          {
            start: 1,
            end: undefined,
            targetId: 3,
            targetInstance: undefined,
          },
        ],
      },
    });
    expect(
      buffApplications([
        applyBuffEvent(1),
        {
          ...applyBuffEvent(1, { timestamp: 1 }),
          targetInstance: 2,
        },
        removeBuffEvent(1, { timestamp: 6 }),
      ]),
    ).toEqual({
      1: {
        1: [
          {
            start: 0,
            end: 6,
            targetId: 2,
            targetInstance: undefined,
          },
          {
            start: 1,
            end: undefined,
            targetId: 2,
            targetInstance: 2,
          },
        ],
      },
    });
    expect(
      buffApplications([
        {
          ...applyBuffEvent(1),
          targetInstance: 2,
        },
        applyBuffEvent(1, { timestamp: 1 }),
        {
          ...removeBuffEvent(1, { timestamp: 6 }),
          targetInstance: 2,
        },
      ]),
    ).toEqual({
      1: {
        1: [
          {
            start: 0,
            end: 6,
            targetId: 2,
            targetInstance: 2,
          },
          {
            start: 1,
            end: undefined,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
    });
  });
  it('handles buff removals of unknown buffs', () => {
    // sometimes we don't have an applybuff event for a removebuff
    expect(buffApplications([removeBuffEvent(1, { timestamp: 2 })])).toEqual({
      1: {
        1: [
          {
            start: undefined,
            end: 2,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
    });
  });
  it('tracks debuff applications', () => {
    expect(buffApplications([applyDebuffEvent(1)])).toEqual({
      1: {
        1: [
          {
            start: 0,
            end: undefined,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
    });
  });
  it('tracks debuff removals', () => {
    expect(buffApplications([removeDebuffEvent(1)])).toEqual({
      1: {
        1: [
          {
            start: undefined,
            end: 0,
            targetId: 2,
            targetInstance: undefined,
          },
        ],
      },
    });
  });
});
