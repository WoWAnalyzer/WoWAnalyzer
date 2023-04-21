import Spell from 'common/SPELLS/Spell';
import {
  EventType,
  CastEvent,
  AnyEvent,
  ApplyBuffEvent,
  RemoveBuffEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import { buffPresent } from './conditions';
import aplCheck, { build, Apl, PlayerInfo, ResultKind, lookaheadSlice } from './index';

// OK, i called this BOF but BOF is a debuff. oops.
const BOF = { id: 3, name: 'Important Buff', icon: '' };
const SHORT_CD = { id: 1, name: 'Cooldown Button', icon: '' };
const FILLER = { id: 2, name: 'Filler', icon: '' };

const ability = (spell: Spell) => ({ guid: spell.id, name: spell.name, abilityIcon: spell.icon });

const info: PlayerInfo = {
  playerId: 0,
  abilities: [
    {
      spell: BOF.id,
      enabled: true,
    },
    {
      spell: SHORT_CD.id,
      enabled: true,
    },
    { spell: FILLER.id, enabled: true },
  ],
} as unknown as PlayerInfo;

/* eslint-disable @typescript-eslint/consistent-type-assertions */

// Generate a cast event, along with cooldown start and end events.
//
// The end event uses `timestamp + cooldown - 1` as the timestamp, with the -1
// preventing casting at exactly cd end from spurious failures due to unstable
// sorting.
const cast = (timestamp: number, cooldown: number, spell: Spell): AnyEvent[] => {
  const cdInfo = {
    overallStart: timestamp,
    chargeStart: timestamp,
    currentRechargeDuration: cooldown,
    expectedEnd: timestamp + cooldown - 1,
    chargesAvailable: 0,
    maxCharges: 1,
  };

  return [
    {
      timestamp,
      ability: ability(spell),
      type: EventType.Cast,
      sourceID: 1,
      sourceIsFriendly: true,
    } as CastEvent,
    ...(cooldown > 0
      ? [
          SpellUsable.generateUpdateSpellUsableEvent(
            spell.id,
            timestamp,
            cdInfo,
            UpdateSpellUsableType.BeginCooldown,
            1,
          ),
          SpellUsable.generateUpdateSpellUsableEvent(
            spell.id,
            timestamp + cooldown - 1,
            {
              ...cdInfo,
              chargesAvailable: 1,
            },
            UpdateSpellUsableType.EndCooldown,
            1,
          ),
        ]
      : []),
  ];
};

const applybuff = (timestamp: number, duration: number, spell: Spell): AnyEvent[] => [
  {
    timestamp,
    ability: ability(spell),
    type: EventType.ApplyBuff,
    targetID: 1,
    targetIsFriendly: true,
    sourceIsFriendly: true,
  } as ApplyBuffEvent,
  {
    timestamp: timestamp + duration - 1,
    ability: ability(spell),
    type: EventType.RemoveBuff,
    targetID: 1,
    sourceID: 1,
    targetIsFriendly: true,
    sourceIsFriendly: true,
  } as RemoveBuffEvent,
];

/* eslint-enable */

describe('Basic APL Check', () => {
  const apl: Apl = build([SHORT_CD, FILLER]);

  const check = aplCheck(apl);

  describe('Perfect Play', () => {
    const events = [
      ...cast(0, 4000, SHORT_CD),
      ...cast(1000, 0, FILLER),
      ...cast(2000, 0, FILLER),
      ...cast(3000, 0, FILLER),
      ...cast(4000, 4000, SHORT_CD),
      ...cast(5000, 0, FILLER),
      ...cast(6000, 0, FILLER),
      ...cast(7000, 0, FILLER),
      ...cast(8000, 4000, SHORT_CD),
    ];

    events.sort((a, b) => a.timestamp - b.timestamp);

    const result = check(events, info);

    it('should report no violations', () => {
      expect(result.violations).toEqual([]);
    });

    it('should have a complete list of successes', () => {
      expect(result.successes.length).toEqual(9);
    });
  });

  describe('Extra Filler Cast', () => {
    const events = [
      ...cast(0, 4000, SHORT_CD),
      ...cast(1000, 0, FILLER),
      ...cast(2000, 0, FILLER),
      ...cast(3000, 0, FILLER),
      ...cast(4000, 0, FILLER),
      ...cast(5000, 4000, SHORT_CD),
      ...cast(6000, 0, FILLER),
      ...cast(7000, 0, FILLER),
      ...cast(8000, 0, FILLER),
      ...cast(9000, 4000, SHORT_CD),
    ];

    events.sort((a, b) => a.timestamp - b.timestamp);

    const result = check(events, info);

    it('should report a single violation', () => {
      expect(result.violations).toEqual([
        {
          kind: ResultKind.Violation,
          actualCast: cast(4000, 0, FILLER)[0],
          expectedCast: [SHORT_CD],
          rule: apl.rules[0],
        },
      ]);
    });

    it('should have identity equality on the cast event', () => {
      // this is important for annotating the timeline
      expect(events).toContain(result.violations[0].actualCast);
    });
  });

  describe('Many Extra Filler Casts', () => {
    const events = [
      ...cast(0, 4000, SHORT_CD),
      ...cast(1000, 0, FILLER),
      ...cast(2000, 0, FILLER),
      ...cast(3000, 0, FILLER),
      ...cast(4000, 0, FILLER),
      ...cast(6000, 0, FILLER),
      ...cast(7000, 0, FILLER),
      ...cast(8000, 0, FILLER),
      ...cast(9000, 4000, SHORT_CD),
    ];

    events.sort((a, b) => a.timestamp - b.timestamp);

    const result = check(events, info);

    it('should report a violation for each extra filler cast', () => {
      expect(result.violations.length).toEqual(4);
    });
  });
});

describe('APL with conditions', () => {
  const bofPresent = buffPresent(BOF);
  const apl = build([
    {
      spell: FILLER,
      condition: bofPresent,
    },
    SHORT_CD,
    FILLER,
  ]);

  const check = aplCheck(apl);

  describe('Perfect Play', () => {
    const events = [
      ...cast(0, 4000, SHORT_CD),
      ...cast(1000, 0, FILLER),
      ...cast(2000, 0, FILLER),
      ...cast(3000, 0, FILLER),
      ...applybuff(3500, 6000, BOF),
      ...cast(4000, 0, FILLER),
      ...cast(5000, 0, FILLER),
      ...cast(6000, 0, FILLER),
      ...cast(7000, 0, FILLER),
      ...cast(8000, 0, FILLER),
      ...cast(9000, 0, FILLER),
      ...cast(10000, 4000, SHORT_CD),
      ...cast(11000, 0, FILLER),
    ];
    events.sort((a, b) => a.timestamp - b.timestamp);

    const result = check(events, info);

    it('should report no violations', () => {
      expect(result.violations).toEqual([]);
    });
  });

  describe('Cast Short CD during Buff', () => {
    const events = [
      ...cast(0, 4000, SHORT_CD),
      ...cast(1000, 0, FILLER),
      ...cast(2000, 0, FILLER),
      ...cast(3000, 0, FILLER),
      ...applybuff(3500, 6000, BOF),
      ...cast(4000, 4000, SHORT_CD),
      ...cast(5000, 0, FILLER),
      ...cast(6000, 0, FILLER),
      ...cast(7000, 0, FILLER),
      ...cast(8000, 0, FILLER),
      ...cast(9000, 0, FILLER),
      ...cast(10000, 4000, SHORT_CD),
      ...cast(11000, 0, FILLER),
    ];

    events.sort((a, b) => a.timestamp - b.timestamp);

    const result = check(events, info);

    it('should report a violation', () => {
      expect(result.violations).toEqual([
        {
          kind: ResultKind.Violation,
          actualCast: cast(4000, 4000, SHORT_CD)[0],
          expectedCast: [FILLER],
          rule: apl.rules[0],
        },
      ]);
    });
  });

  describe('Cast extra filler after Buff', () => {
    const events = [
      ...cast(0, 4000, SHORT_CD),
      ...cast(1000, 0, FILLER),
      ...cast(2000, 0, FILLER),
      ...cast(3000, 0, FILLER),
      ...applybuff(3500, 6000, BOF),
      ...cast(4000, 0, FILLER),
      ...cast(5000, 0, FILLER),
      ...cast(6000, 0, FILLER),
      ...cast(7000, 0, FILLER),
      ...cast(8000, 0, FILLER),
      ...cast(9000, 0, FILLER),
      ...cast(10000, 0, FILLER),
      ...cast(11000, 4000, SHORT_CD),
    ];

    events.sort((a, b) => a.timestamp - b.timestamp);

    const result = check(events, info);

    it('should report a violation', () => {
      expect(result.violations).toEqual([
        {
          kind: ResultKind.Violation,
          actualCast: cast(10000, 0, FILLER)[0],
          expectedCast: [SHORT_CD],
          rule: apl.rules[1],
        },
      ]);
    });
  });
});

describe('lookaheadSlice', () => {
  it('should produce an empty array when the lookahead is undefined', () => {
    expect(lookaheadSlice(cast(0, 4000, SHORT_CD), 0, undefined)).toEqual([]);
  });

  it('should produce a list spanning the duration when present', () => {
    const events = [
      ...cast(0, 4000, SHORT_CD),
      // unrealistic, but humor me
      ...cast(100, 0, FILLER),
      ...cast(200, 0, FILLER),
      ...cast(1000, 0, FILLER),
    ];

    events.sort((a, b) => a.timestamp - b.timestamp);

    expect(lookaheadSlice(events, 0, 300)).toEqual(events.filter((ev) => ev.timestamp <= 300));
  });

  it('should only include events that occur after the given event index', () => {
    const events = [
      ...cast(0, 4000, SHORT_CD),
      // unrealistic, but humor me
      ...cast(100, 0, FILLER),
      ...cast(200, 0, FILLER),
      ...cast(400, 0, FILLER),
      ...cast(500, 0, FILLER),
      ...cast(1000, 0, FILLER),
    ];

    events.sort((a, b) => a.timestamp - b.timestamp);

    const start = events.findIndex((ev) => ev.timestamp === 200);

    expect(lookaheadSlice(events, start, 300)).toEqual(
      events.filter((ev, ix) => ix >= start && ev.timestamp <= events[start].timestamp + 300),
    );
  });
});
