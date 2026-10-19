import Spell from 'common/SPELLS/Spell';
import { AnyEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import BuffStackRefreshRemover, { BuffStackRefreshPairing } from './BuffStackRefreshRemover';

const mockBuff = (id: number): Spell => ({ id, name: `Buff ${id}`, icon: '' });

const REMOVE_PAIRED = mockBuff(1);
const APPLY_PAIRED = mockBuff(2);
const BOTH_PAIRED = mockBuff(3);
const UNPAIRED = mockBuff(4);

const PAIRINGS: BuffStackRefreshPairing[] = [
  { buff: REMOVE_PAIRED, pairedWith: [EventType.RemoveBuffStack] },
  { buff: APPLY_PAIRED, pairedWith: [EventType.ApplyBuffStack] },
  {
    buff: BOTH_PAIRED,
    pairedWith: [EventType.ApplyBuffStack, EventType.RemoveBuffStack],
    bufferMs: 50,
  },
];

function fakeEvent(timestamp: number, type: EventType, buff: Spell) {
  return {
    type,
    timestamp,
    ability: {
      guid: buff.id,
    },
  } as AnyEvent;
}

const applybuffstack = (timestamp: number, buff: Spell) =>
  fakeEvent(timestamp, EventType.ApplyBuffStack, buff);
const removebuffstack = (timestamp: number, buff: Spell) =>
  fakeEvent(timestamp, EventType.RemoveBuffStack, buff);
const refreshbuff = (timestamp: number, buff: Spell) =>
  fakeEvent(timestamp, EventType.RefreshBuff, buff);

function normalize(events: AnyEvent[]) {
  return new BuffStackRefreshRemover({} as Options, PAIRINGS).normalize(events);
}

describe('BuffStackRefreshRemover', () => {
  it('removes a refresh right after a paired stack event', () => {
    const events = [removebuffstack(1000, REMOVE_PAIRED), refreshbuff(1010, REMOVE_PAIRED)];

    expect(normalize(events)).toEqual([events[0]]);
  });

  it('removes a refresh on the same timestamp as a paired stack event', () => {
    const events = [applybuffstack(1000, APPLY_PAIRED), refreshbuff(1000, APPLY_PAIRED)];

    expect(normalize(events)).toEqual([events[0]]);
  });

  it('keeps a refresh outside of the default buffer', () => {
    const events = [removebuffstack(1000, REMOVE_PAIRED), refreshbuff(1026, REMOVE_PAIRED)];

    expect(normalize(events)).toEqual(events);
  });

  it('uses the buffer of the pairing', () => {
    const events = [
      applybuffstack(1000, BOTH_PAIRED),
      refreshbuff(1050, BOTH_PAIRED),
      removebuffstack(2000, BOTH_PAIRED),
      refreshbuff(2051, BOTH_PAIRED),
    ];

    expect(normalize(events)).toEqual([events[0], events[2], events[3]]);
  });

  it('removes at most one refresh per stack event', () => {
    const events = [
      removebuffstack(1000, REMOVE_PAIRED),
      refreshbuff(1000, REMOVE_PAIRED),
      refreshbuff(1005, REMOVE_PAIRED),
    ];

    expect(normalize(events)).toEqual([events[0], events[2]]);
  });

  it('keeps a refresh after a stack event that is not paired', () => {
    const events = [applybuffstack(1000, REMOVE_PAIRED), refreshbuff(1000, REMOVE_PAIRED)];

    expect(normalize(events)).toEqual(events);
  });

  it('keeps a refresh before its stack event', () => {
    const events = [refreshbuff(1000, REMOVE_PAIRED), removebuffstack(1005, REMOVE_PAIRED)];

    expect(normalize(events)).toEqual(events);
  });

  it('does not pair stack events and refreshes of different buffs', () => {
    const events = [removebuffstack(1000, REMOVE_PAIRED), refreshbuff(1000, BOTH_PAIRED)];

    expect(normalize(events)).toEqual(events);
  });

  it('keeps refreshes of buffs without a pairing', () => {
    const events = [removebuffstack(1000, UNPAIRED), refreshbuff(1000, UNPAIRED)];

    expect(normalize(events)).toEqual(events);
  });
});
