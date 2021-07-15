import {
  AnyEvent,
  BeginChannelEvent,
  CastEvent,
  EndChannelEvent,
  EventType,
  GlobalCooldownEvent,
} from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import { ctp } from 'parser/core/timePeriods.test';
import {
  activeTimePercent,
  activeTimePeriods,
  channelTimePeriods, gcdTimePeriods,
} from 'parser/shared/metrics/activeTime';

/** Testing info with fight from 0 to 1000 */
function _info(): Info {
  return {
    abilities: [],
    playerId: 1,
    fightStart: 0,
    fightEnd: 1000,
  };
}

// TODO testing event fabrication to common helper?
function _beginChannel(
  spellId: number,
  timestamp: number,
  isCancelled: boolean,
  others?: Partial<BeginChannelEvent>,
): BeginChannelEvent {
  return {
    type: EventType.BeginChannel,
    timestamp,
    ability: {
      guid: spellId,
      name: 'test',
      type: 1,
      abilityIcon: 'test',
    },
    sourceID: 1,
    isCancelled,
    ...others,
  };
}

function _endChannel(
  spellId: number,
  timestamp: number,
  beginChannel: BeginChannelEvent | number,
  others?: Partial<EndChannelEvent>,
): EndChannelEvent {
  let beginChannelEvent: BeginChannelEvent;
  let start: number;
  if (typeof beginChannel === 'number') {
    beginChannelEvent = _beginChannel(spellId, beginChannel, false);
    start = beginChannel;
  } else {
    beginChannelEvent = beginChannel;
    start = beginChannel.timestamp;
  }
  return {
    type: EventType.EndChannel,
    timestamp,
    ability: {
      guid: spellId,
      name: 'test',
      type: 1,
      abilityIcon: 'test',
    },
    start,
    duration: timestamp - start,
    beginChannel: beginChannelEvent,
    sourceID: 1,
    ...others,
  };
}

function _gcd(
  spellId: number,
  timestamp: number,
  duration: number,
  triggerEvent?: BeginChannelEvent | CastEvent,
  others?: Partial<GlobalCooldownEvent>,
): GlobalCooldownEvent {
  const trigger = triggerEvent === undefined ? _beginChannel(1, timestamp, false) : triggerEvent;
  return {
    type: EventType.GlobalCooldown,
    timestamp,
    ability: {
      guid: spellId,
      name: 'test',
      type: 1,
      abilityIcon: 'test',
    },
    duration,
    sourceID: 1,
    targetID: 1,
    targetIsFriendly: false,
    trigger,
    __fabricated: true,
    ...others,
  };
}

describe('channelTimePeriods', () => {
  const info = _info();
  it('simple', () => {
    const events: AnyEvent[] = [
      _endChannel(1, 100, 0),
      _endChannel(2, 400, 300),
      _endChannel(1, 1000, 800),
    ];
    expect(channelTimePeriods(events, info)).toEqual([ctp(0, 100), ctp(300, 400), ctp(800, 1000)]);
  });
  it('ending channel in progress', () => {
    const events: AnyEvent[] = [
      _endChannel(1, 100, 0),
      _endChannel(2, 400, 300),
      _endChannel(1, 600, 500),
      _beginChannel(3, 900, false),
    ];
    expect(channelTimePeriods(events, info)).toEqual([
      ctp(0, 100),
      ctp(300, 400),
      ctp(500, 600),
      ctp(900, 1000),
    ]);
  });
  it('cancels', () => {
    const events: AnyEvent[] = [
      _endChannel(1, 100, 0),
      _beginChannel(4, 200, true),
      _endChannel(2, 400, 300),
      _endChannel(1, 600, 500),
      _beginChannel(3, 900, true),
    ];
    expect(channelTimePeriods(events, info)).toEqual([ctp(0, 100), ctp(300, 400), ctp(500, 600)]);
  });
});

describe('gcdTimePeriods', () => {
  const info = _info();
  it('simple', () => {
    const events: AnyEvent[] = [_gcd(1, 0, 100), _gcd(1, 400, 150), _gcd(1, 700, 120)];
    expect(gcdTimePeriods(events, info)).toEqual([ctp(0, 100), ctp(400, 550), ctp(700, 820)]);
  });
  it('overlapping', () => {
    const events: AnyEvent[] = [_gcd(1, 0, 100), _gcd(1, 400, 150), _gcd(1, 500, 120)];
    expect(gcdTimePeriods(events, info)).toEqual([ctp(0, 100), ctp(400, 550), ctp(500, 620)]);
  });
});

describe('activeTimePeriods', () => {
  const info = _info();
  it('simple no overlap', () => {
    const events: AnyEvent[] = [
      _gcd(1, 0, 100),
      _endChannel(1, 300, 200),
      _gcd(1, 400, 150),
      _endChannel(1, 900, 800),
    ];
    expect(activeTimePeriods(events, info)).toEqual([
      ctp(0, 100),
      ctp(200, 300),
      ctp(400, 550),
      ctp(800, 900),
    ]);
    expect(activeTimePercent(events, info)).toEqual(0.45);
  });
  it('chaincast', () => {
    // back to back casts should have time period fused together
    const events: AnyEvent[] = [
      _gcd(1, 0, 100),
      _gcd(1, 100, 150),
      _gcd(1, 250, 150),
      // gap
      _gcd(1, 600, 150),
    ];
    expect(activeTimePeriods(events, info)).toEqual([ctp(0, 400), ctp(600, 750)]);
    expect(activeTimePercent(events, info)).toEqual(0.55);
  });
  // this will be more like the realistic case because channeling will almost always overlap with GCD
  it('simple overlapping channel and gcd', () => {
    const events: AnyEvent[] = [
      // channel from 100 to 300 w/ 100 GCD
      _gcd(1, 100, 100),
      _endChannel(1, 300, 100),
      // channel from 400 to 600 w/ 100 GCD
      _gcd(1, 400, 100),
      _endChannel(1, 600, 400),
      // instant @ 600 (will combine with prev cast) 100 GCD
      _gcd(1, 600, 100),
      // another instant @ 800 w/ 100 GCD
      _gcd(1, 800, 100),
    ];
    expect(activeTimePeriods(events, info)).toEqual([ctp(100, 300), ctp(400, 700), ctp(800, 900)]);
    expect(activeTimePercent(events, info)).toEqual(0.6);
  });
  it('channel shorter than gcd', () => {
    const events: AnyEvent[] = [
      _gcd(1, 100, 150),
      _endChannel(1, 200, 100),
      _gcd(1, 400, 150),
      _endChannel(1, 500, 400),
    ];
    expect(activeTimePeriods(events, info)).toEqual([ctp(100, 250), ctp(400, 550)]);
  });
  it('off end gcd', () => {
    const events: AnyEvent[] = [_gcd(1, 900, 150)];
    expect(activeTimePeriods(events, info)).toEqual([ctp(900, 1000)]);
  });
});
