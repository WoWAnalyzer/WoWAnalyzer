import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { ResourceLink, SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/paladin';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { suggestion as buildSuggestion } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import aplCheck, { build, Condition, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';

const wingsUp = cnd.describe(
  cnd.or(cnd.buffPresent(TALENTS.AVENGING_WRATH_TALENT), cnd.buffPresent(SPELLS.SENTINEL)),
  () => '',
);

const howCastable = cnd.always(wingsUp);

const judgmentCastable = cnd.describe(
  cnd.and(cnd.buffMissing(TALENTS.AVENGING_WRATH_TALENT), cnd.buffMissing(SPELLS.SENTINEL)),
  () => '',
);

const judgmentAtMaxCharges = cnd.describe(
  cnd.or(
    cnd.not(cnd.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT)),
    cnd.spellCharges(SPELLS.JUDGMENT_CAST_PROTECTION, { atLeast: 2 }),
  ),
  (tense) => (
    <>
      <SpellLink spell={SPELLS.JUDGMENT_CAST_PROTECTION} /> {tenseAlt(tense, 'is', 'was')} at max
      charges
    </>
  ),
);

const castIs = (spells: Spell[]): Condition<null> => ({
  key: `castIs-${spells.map((spell) => spell.id).join('-')}`,
  init: () => null,
  update: (state) => state,
  validate: (_state, event) => spells.some((spell) => spell.id === event.ability.guid),
  describe: () => '',
});

const SAME_CAST_MS = 20;

interface HolyPowerState {
  playerId: number;
  current: number;
  recentGains: { timestamp: number; amount: number }[];
}

const holyPowerBeforeCast = (atLeast: number): Condition<HolyPowerState> => ({
  key: `holyPowerBeforeCast-${atLeast}`,
  init: (info) => ({ playerId: info.playerId, current: 0, recentGains: [] }),
  update: (state, event) => {
    if (
      event.type === EventType.ResourceChange &&
      event.resourceChangeType === RESOURCE_TYPES.HOLY_POWER.id &&
      event.targetID === state.playerId
    ) {
      const amount = event.resourceChange - event.waste;
      return {
        ...state,
        current: state.current + amount,
        recentGains: [
          ...state.recentGains.filter((gain) => event.timestamp - gain.timestamp <= SAME_CAST_MS),
          { timestamp: event.timestamp, amount },
        ],
      };
    }
    if (event.type === EventType.Cast && event.sourceID === state.playerId) {
      const cost = event.classResources?.find(
        ({ type }) => type === RESOURCE_TYPES.HOLY_POWER.id,
      )?.cost;
      if (cost) {
        return { ...state, current: Math.max(0, state.current - cost) };
      }
    }
    return state;
  },
  validate: (state, event) => {
    const sameCastGain = state.recentGains
      .filter((gain) => event.timestamp - gain.timestamp <= SAME_CAST_MS)
      .reduce((total, gain) => total + gain.amount, 0);
    return state.current - sameCastGain >= atLeast;
  },
  describe: (tense) => (
    <>
      you {tenseAlt(tense, 'have', 'had')} {atLeast}{' '}
      <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />
    </>
  ),
});

const atMaxHolyPower = holyPowerBeforeCast(5);

interface StacksState {
  playerId: number;
  stacks: number;
  recentGains: { timestamp: number; amount: number }[];
}

const divineGuidanceBeforeCast = (atLeast: number): Condition<StacksState> => ({
  key: `divineGuidanceBeforeCast-${atLeast}`,
  init: (info) => ({ playerId: info.playerId, stacks: 0, recentGains: [] }),
  update: (state, event) => {
    if (
      event.type !== EventType.ApplyBuff &&
      event.type !== EventType.ApplyBuffStack &&
      event.type !== EventType.RemoveBuffStack &&
      event.type !== EventType.RemoveBuff
    ) {
      return state;
    }
    if (
      event.ability.guid !== SPELLS.DIVINE_GUIDANCE_BUFF.id ||
      event.targetID !== state.playerId
    ) {
      return state;
    }
    const stacks =
      event.type === EventType.ApplyBuff
        ? 1
        : event.type === EventType.RemoveBuff
          ? 0
          : event.stack;
    const gain = stacks - state.stacks;
    return {
      ...state,
      stacks,
      recentGains:
        gain > 0
          ? [
              ...state.recentGains.filter((g) => event.timestamp - g.timestamp <= SAME_CAST_MS),
              { timestamp: event.timestamp, amount: gain },
            ]
          : state.recentGains,
    };
  },
  validate: (state, event) => {
    const sameCastGain = state.recentGains
      .filter((gain) => event.timestamp - gain.timestamp <= SAME_CAST_MS)
      .reduce((total, gain) => total + gain.amount, 0);
    return state.stacks - sameCastGain >= atLeast;
  },
  describe: (tense) => (
    <>
      you {tenseAlt(tense, 'have', 'had')} {atLeast} stacks of{' '}
      <SpellLink spell={SPELLS.DIVINE_GUIDANCE_BUFF} />
    </>
  ),
});

export const apl = build([
  {
    spell: TALENTS.AVENGERS_SHIELD_TALENT,
    condition: cnd.optionalRule(
      cnd.and(judgmentCastable, cnd.buffMissing(SPELLS.VANGUARD_BUFF), atMaxHolyPower),
    ),
  },
  {
    spell: SPELLS.CONSECRATION_CAST,
    condition: cnd.always(
      cnd.describe(
        cnd.and(
          judgmentCastable,
          castIs([SPELLS.SHIELD_OF_THE_RIGHTEOUS]),
          cnd.hasTalent(TALENTS.DIVINE_GUIDANCE_TALENT),
          divineGuidanceBeforeCast(5),
        ),
        (tense) => (
          <>
            you {tenseAlt(tense, 'have', 'had')} 5 stacks of{' '}
            <SpellLink spell={SPELLS.DIVINE_GUIDANCE_BUFF} />
          </>
        ),
      ),
    ),
  },
  {
    spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS,
    condition: cnd.always(atMaxHolyPower),
  },
  {
    spell: SPELLS.HAMMER_OF_WRATH_PROTECTION,
    condition: cnd.describe(
      cnd.and(howCastable, cnd.spellCharges(SPELLS.HAMMER_OF_WRATH_PROTECTION, { atLeast: 2 })),
      (tense) => (
        <>
          <SpellLink spell={SPELLS.HAMMER_OF_WRATH_PROTECTION} /> {tenseAlt(tense, 'is', 'was')} at
          max charges
        </>
      ),
    ),
  },
  {
    spell: TALENTS.AVENGERS_SHIELD_TALENT,
    condition: cnd.optionalRule(cnd.or(wingsUp, cnd.buffPresent(SPELLS.VANGUARD_BUFF))),
  },
  { spell: SPELLS.HAMMER_OF_WRATH_PROTECTION, condition: howCastable },
  {
    spell: SPELLS.JUDGMENT_CAST_PROTECTION,
    condition: cnd.always(cnd.and(judgmentCastable, judgmentAtMaxCharges)),
  },
  [
    SPELLS.JUDGMENT_CAST_PROTECTION,
    TALENTS.AVENGERS_SHIELD_TALENT,
    TALENTS.BLESSED_HAMMER_TALENT,
    TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT,
  ],
]);

export const check = aplCheck(apl);

export default buildSuggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
