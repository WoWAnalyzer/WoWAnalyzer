import { Options } from 'parser/core/Analyzer';
import { AnyEvent, EventType, GetRelatedEvents } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { SuddenDoomLinkNormalizer } from './SuddenDoomLink';

const SUDDEN_DOOM_ID = SPELLS.SUDDEN_DOOM_BUFF.id;
const DEATH_COIL_ID = SPELLS.DEATH_COIL.id;

function makeRemoveBuff(timestamp: number, sourceID = 1): AnyEvent {
  return {
    type: EventType.RemoveBuff,
    timestamp,
    sourceID,
    sourceIsFriendly: true,
    targetID: sourceID,
    targetIsFriendly: true,
    ability: { guid: SUDDEN_DOOM_ID, name: 'Sudden Doom', type: 1, abilityIcon: '' },
  } as AnyEvent;
}

function makeRemoveBuffStack(timestamp: number, sourceID = 1, stack = 1): AnyEvent {
  return {
    type: EventType.RemoveBuffStack,
    timestamp,
    sourceID,
    sourceIsFriendly: true,
    targetID: sourceID,
    targetIsFriendly: true,
    stack,
    ability: { guid: SUDDEN_DOOM_ID, name: 'Sudden Doom', type: 1, abilityIcon: '' },
  } as AnyEvent;
}

function makeCast(timestamp: number, spellId = DEATH_COIL_ID, sourceID = 1): AnyEvent {
  return {
    type: EventType.Cast,
    timestamp,
    sourceID,
    sourceIsFriendly: true,
    targetID: 2,
    targetIsFriendly: false,
    ability: { guid: spellId, name: 'Death Coil', type: 32, abilityIcon: '' },
  } as AnyEvent;
}

function normalize(events: AnyEvent[]) {
  const normalizer = new SuddenDoomLinkNormalizer({} as Options);
  return normalizer.normalize(events);
}

describe('SuddenDoomLinkNormalizer (removebuff)', () => {
  it('links removebuff to a cast at the same timestamp', () => {
    const removeBuff = makeRemoveBuff(1000);
    const cast = makeCast(1000);

    normalize([removeBuff, cast]);

    const linked = GetRelatedEvents(removeBuff, 'sudden-doom-consumption');
    expect(linked).toHaveLength(1);
    expect(linked[0]).toBe(cast);
  });

  it('links removebuff to a cast that follows within the buffer window', () => {
    const removeBuff = makeRemoveBuff(1000);
    const cast = makeCast(1200);

    normalize([removeBuff, cast]);

    const linked = GetRelatedEvents(removeBuff, 'sudden-doom-consumption');
    expect(linked).toHaveLength(1);
    expect(linked[0]).toBe(cast);
  });

  it('links removebuff to a cast that precedes within the buffer window', () => {
    const cast = makeCast(1000);
    const removeBuff = makeRemoveBuff(1200);

    normalize([cast, removeBuff]);

    const linked = GetRelatedEvents(removeBuff, 'sudden-doom-consumption');
    expect(linked).toHaveLength(1);
    expect(linked[0]).toBe(cast);
  });

  it('does not link when cast is outside the buffer window', () => {
    const removeBuff = makeRemoveBuff(1000);
    const cast = makeCast(2000);

    normalize([removeBuff, cast]);

    const linked = GetRelatedEvents(removeBuff, 'sudden-doom-consumption');
    expect(linked).toHaveLength(0);
  });

  it('creates a reverse link from cast to removebuff', () => {
    const removeBuff = makeRemoveBuff(1000);
    const cast = makeCast(1000);

    normalize([removeBuff, cast]);

    const reverseLinked = GetRelatedEvents(cast, 'sudden-doom-consumed-buff');
    expect(reverseLinked).toHaveLength(1);
    expect(reverseLinked[0]).toBe(removeBuff);
  });

  it('links at most one cast per removebuff', () => {
    const removeBuff = makeRemoveBuff(1000);
    const cast1 = makeCast(1000);
    const cast2 = makeCast(1000);

    normalize([removeBuff, cast1, cast2]);

    const linked = GetRelatedEvents(removeBuff, 'sudden-doom-consumption');
    expect(linked).toHaveLength(1);
  });

  it('does not link a non-consumer spell', () => {
    const removeBuff = makeRemoveBuff(1000);
    const cast = makeCast(1000, 999999);

    normalize([removeBuff, cast]);

    const linked = GetRelatedEvents(removeBuff, 'sudden-doom-consumption');
    expect(linked).toHaveLength(0);
  });
});

describe('SuddenDoomLinkNormalizer (removebuffstack)', () => {
  it('links removebuffstack to a cast at the same timestamp', () => {
    const removeStack = makeRemoveBuffStack(1000);
    const cast = makeCast(1000);

    normalize([removeStack, cast]);

    const linked = GetRelatedEvents(removeStack, 'sudden-doom-consumption');
    expect(linked).toHaveLength(1);
    expect(linked[0]).toBe(cast);
  });

  it('links removebuffstack to a cast that follows within the buffer window', () => {
    const removeStack = makeRemoveBuffStack(1000);
    const cast = makeCast(1300);

    normalize([removeStack, cast]);

    const linked = GetRelatedEvents(removeStack, 'sudden-doom-consumption');
    expect(linked).toHaveLength(1);
    expect(linked[0]).toBe(cast);
  });

  it('links removebuffstack when cast precedes (WCL reordering)', () => {
    const cast = makeCast(1000);
    const removeStack = makeRemoveBuffStack(1000);

    normalize([cast, removeStack]);

    const linked = GetRelatedEvents(removeStack, 'sudden-doom-consumption');
    expect(linked).toHaveLength(1);
    expect(linked[0]).toBe(cast);
  });

  it('creates a reverse link from cast to removebuffstack', () => {
    const removeStack = makeRemoveBuffStack(1000);
    const cast = makeCast(1000);

    normalize([removeStack, cast]);

    const reverseLinked = GetRelatedEvents(cast, 'sudden-doom-consumed-buff');
    expect(reverseLinked).toHaveLength(1);
    expect(reverseLinked[0]).toBe(removeStack);
  });

  it('does not link when cast is outside the buffer window', () => {
    const removeStack = makeRemoveBuffStack(1000);
    const cast = makeCast(2000);

    normalize([removeStack, cast]);

    const linked = GetRelatedEvents(removeStack, 'sudden-doom-consumption');
    expect(linked).toHaveLength(0);
  });
});
