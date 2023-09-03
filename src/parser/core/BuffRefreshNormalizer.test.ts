import { Options } from './Analyzer';
import BuffRefreshNormalizer from './BuffRefreshNormalizer';
import { AnyEvent, EventType } from './Events';

function fakeEvent(timestamp: number, type: EventType, abilityId: number, __modified?: boolean) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    type,
    timestamp,
    ability: {
      guid: abilityId,
    },
    ...(__modified ? { __modified } : {}),
  } as AnyEvent;
}

class T extends BuffRefreshNormalizer {
  constructor(abiltities: number | readonly number[], bufferMs?: number) {
    super(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {} as Options,
      abiltities,
      bufferMs,
    );
  }
}

describe('BuffRefreshNormalizer', () => {
  it('should merge a remove and apply into a refresh', () => {
    const t = new T(1);

    const events = [fakeEvent(1, EventType.RemoveBuff, 1), fakeEvent(2, EventType.ApplyBuff, 1)];
    const result = t.normalize(events);

    expect(result).toEqual([
      fakeEvent(
        // The refresh will use the same timestamp as the "remove" event.
        1,
        EventType.RefreshBuff,
        1,
        true,
      ),
    ]);
  });

  it('should not merge a remove and apply into a refresh if the buffer is too large', () => {
    const t = new T(1, 100);

    const events = [fakeEvent(0, EventType.RemoveBuff, 1), fakeEvent(101, EventType.ApplyBuff, 1)];
    const result = t.normalize(events);

    expect(result).toEqual(events);
  });

  it('should not merge a remove and apply into a refresh if the ability is not whitelisted', () => {
    const t = new T(1);

    const events = [fakeEvent(1, EventType.RemoveBuff, 2), fakeEvent(2, EventType.ApplyBuff, 2)];
    const result = t.normalize(events);

    expect(result).toEqual(events);
  });

  it('should not merge a remove and apply into a refresh if the ability is not the same', () => {
    const t = new T([1, 2]);

    const events = [fakeEvent(1, EventType.RemoveBuff, 1), fakeEvent(2, EventType.ApplyBuff, 2)];
    const result = t.normalize(events);

    expect(result).toEqual(events);
  });

  it('should not merge if the apply comes before the remove', () => {
    const t = new T(1);

    const events = [fakeEvent(1, EventType.ApplyBuff, 1), fakeEvent(2, EventType.RemoveBuff, 1)];
    const result = t.normalize(events);

    expect(result).toEqual(events);
  });

  it('should still merge even if there are other events in between', () => {
    const t = new T(1);

    const events = [
      fakeEvent(1, EventType.RemoveBuff, 1),
      fakeEvent(2, EventType.Damage, 1),
      fakeEvent(3, EventType.ApplyBuff, 1),
    ];
    const result = t.normalize(events);

    expect(result).toEqual([
      fakeEvent(1, EventType.RefreshBuff, 1, true),
      fakeEvent(2, EventType.Damage, 1),
    ]);
  });
});
