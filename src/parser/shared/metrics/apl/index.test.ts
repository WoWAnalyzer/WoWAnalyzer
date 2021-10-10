import Spell from 'common/SPELLS/Spell';
import { EventType } from 'parser/core/Events';

import aplCheck, { build, Apl, buffPresent } from './index';

// OK, i called this BOF but BOF is a debuff. oops.
const BOF = { id: 3, name: 'Important Buff', icon: '' };
const SHORT_CD = { id: 1, name: 'Cooldown Button', icon: '' };
const FILLER = { id: 2, name: 'Filler', icon: '' };

const ability = (spell: Spell) => ({ guid: spell.id });

// Generate a cast event, along with cooldown start and end events.
//
// The end event uses `timestamp + cooldown - 1` as the timestamp, with the -1
// preventing casting at exactly cd end from spurious failures due to unstable
// sorting.
const cast = (timestamp: number, cooldown: number, spell: Spell) => [
  {
    timestamp,
    ability: ability(spell),
    type: EventType.Cast,
  },
  ...(cooldown > 0
    ? [
        {
          timestamp,
          ability: ability(spell),
          type: EventType.UpdateSpellUsable,
          trigger: EventType.BeginCooldown,
          isOnCooldown: true,
          isAvailable: false,
        },
        {
          timestamp: timestamp + cooldown - 1,
          ability: ability(spell),
          type: EventType.UpdateSpellUsable,
          trigger: EventType.EndCooldown,
          isOnCooldown: false,
          isAvailable: true,
        },
      ]
    : []),
];

const applybuff = (timestamp: number, duration: number, spell: Spell) => [
  {
    timestamp,
    ability: ability(spell),
    type: EventType.ApplyBuff,
  },
  {
    timestamp: timestamp + duration - 1,
    ability: ability(spell),
    type: EventType.RemoveBuff,
  },
];

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

    const result = check(events, { playerId: 0 });

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

    const result = check(events, { playerId: 0 });

    it('should report a single violation', () => {
      expect(result.violations).toEqual([
        {
          actualCast: cast(4000, 0, FILLER)[0],
          expectedCast: SHORT_CD,
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

    const result = check(events, { playerId: 0 });

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

    const result = check(events, { playerId: 0 });

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

    const result = check(events, { playerId: 0 });

    it('should report a violation', () => {
      expect(result.violations).toEqual([
        {
          actualCast: cast(4000, 4000, SHORT_CD)[0],
          expectedCast: FILLER,
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

    const result = check(events, { playerId: 0 });

    it('should report a violation', () => {
      expect(result.violations).toEqual([
        {
          actualCast: cast(10000, 0, FILLER)[0],
          expectedCast: SHORT_CD,
          rule: apl.rules[1],
        },
      ]);
    });
  });
});
