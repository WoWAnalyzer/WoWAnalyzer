import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { TIERS } from 'game/TIERS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { EventType, HasAbility, HasTarget } from 'parser/core/Events';
import {
  and,
  buffMissing,
  buffPresent,
  buffRemaining,
  buffStacks,
  describe,
  has2PieceByTier,
  hasResource,
  hasTalent,
  not,
  optionalRule,
  or,
  spellAvailable,
  spellCooldownRemaining,
  targetsHit,
} from 'parser/shared/metrics/apl/conditions';
import { build, Condition, Rule, tenseAlt } from 'parser/shared/metrics/apl';
import { SpellLink } from 'interface';
import type { JSX } from 'react';
import type { Talent } from 'common/TALENTS/types';

import {
  comboPointDeficitAtMost,
  fanTheHammerComboPointDeficit,
  finisherComboPointCondition,
} from './comboPointAmount';
import { ROLL_THE_BONES_STAGE_AURAS } from '../../constants';

const OPPORTUNITY_DURATION = 12000;
const BLADE_FLURRY_BASE_DURATION = 10000;
const BLADE_FLURRY_DANCING_STEEL_DURATION = 13000;
const BASE_GCD = 1000;
const BETWEEN_THE_EYES_ENERGY_COST = 25;
const DISPATCH_ENERGY_COST = 35;
const KILLING_SPREE_ENERGY_COST = 45;
const ACTIVE_TARGET_WINDOW = 3000;
// SimC: `cooldown.adrenaline_rush.remains>30`
const BETWEEN_THE_EYES_ADRENALINE_RUSH_HOLD_WINDOW = 30000;
// SimC gates Adrenaline Rush on `raid_event.adds`, which has no log equivalent. WoWAnalyzer uses
// remaining fight time instead so that a cast just before the boss dies is not treated as correct.
// The threshold is Adrenaline Rush's own 15 second duration: below that, the buff cannot run out.
const ADRENALINE_RUSH_MIN_REMAINING_FIGHT_TIME = 15000;
const PREPARATION_ADRENALINE_RUSH_WINDOW = 30000;
const PREPARATION_FIGHT_REMAINS_WINDOW = 30000;

// The shared `not` renders "don't <condition>", which reads badly; these supply real English.
const missingTalent = (talent: Talent) =>
  describe(not(hasTalent(talent), false), (tense) => (
    <>
      you {tenseAlt(tense, 'do', 'did')} not have <SpellLink spell={talent} /> talented
    </>
  ));

const betweenTheEyesOnCooldown = () =>
  describe(not(betweenTheEyesAvailable(), false), (tense) => (
    <>
      <SpellLink spell={SPELLS.BETWEEN_THE_EYES} /> {tenseAlt(tense, 'is', 'was')} on cooldown
    </>
  ));

const belowFinisherThreshold = () =>
  describe(not(finisherComboPointCondition(), false), (tense) => (
    <>you {tenseAlt(tense, 'are', 'were')} below the combo points needed to spend</>
  ));

const inStealthStance = () =>
  describe(
    or(
      buffPresent(SPELLS.SUBTERFUGE_BUFF),
      buffPresent(SPELLS.STEALTH_BUFF),
      buffPresent(SPELLS.VANISH_BUFF),
    ),
    (tense) => <>you {tenseAlt(tense, 'are', 'were')} in stealth stance</>,
  );

const ambushAvailable = () =>
  or(
    // Offset prevents the Pistol Shot that procs Audacity from being blamed before the buff event lands.
    buffPresent(SPELLS.AUDACITY_TALENT_BUFF, 100),
    inStealthStance(),
  );

const rollTheBonesCount = (count: number, comparison: 'atLeast' | 'exactly' | 'lessThan') =>
  comparison === 'atLeast'
    ? or(...ROLL_THE_BONES_STAGE_AURAS.slice(count - 1).map((spell) => buffPresent(spell)))
    : comparison === 'exactly'
      ? buffPresent(ROLL_THE_BONES_STAGE_AURAS[count - 1])
      : or(
          buffMissing(SPELLS.ROLL_THE_BONES),
          ...ROLL_THE_BONES_STAGE_AURAS.slice(0, count - 1).map((spell) => buffPresent(spell)),
        );

const rollTheBonesMissing = () =>
  and(...ROLL_THE_BONES_STAGE_AURAS.map((spell) => buffMissing(spell)));

const rollTheBonesCondition = () =>
  or(
    rollTheBonesMissing(),
    rollTheBonesCount(1, 'exactly'),
    and(
      buffPresent(TALENTS.LOADED_DICE_TALENT),
      betweenTheEyesAvailable(),
      rollTheBonesCount(2, 'exactly'),
    ),
  );

/**
 * A trivially-true condition, for use inside `optionalRule` so that a rule only ever matches the
 * actual cast of its own spell. Mirrors the idiom in Windwalker's `common.tsx`.
 */
const castWasMade = (description: JSX.Element) =>
  describe(hasResource(RESOURCE_TYPES.ENERGY, { atLeast: 0 }), () => description);

const fightTimeRemaining = (remainingTime: number): Condition<number> => ({
  key: `outlaw-fight-time-remaining-${remainingTime}`,
  init: ({ combatant }) => combatant.owner.fight.end_time,
  update: (state) => state,
  validate: (state, event) => state - event.timestamp >= remainingTime,
  describe: (tense) => (
    <>
      there {tenseAlt(tense, 'is', 'was')} at least {remainingTime / 1000} seconds of combat
      remaining
    </>
  ),
});

/** SimC's `fight_remains<x`. */
const fightEndingWithin = (remainingTime: number): Condition<number> => ({
  key: `outlaw-fight-ending-within-${remainingTime}`,
  init: ({ combatant }) => combatant.owner.fight.end_time,
  update: (state) => state,
  validate: (state, event) => state - event.timestamp < remainingTime,
  describe: (tense) => (
    <>
      the fight {tenseAlt(tense, 'is', 'was')} ending within {remainingTime / 1000} seconds
    </>
  ),
});

interface ActiveTargetState {
  playerId: number;
  targets: Map<string, number>;
}

const activeTargets = (minimumTargets: number): Condition<ActiveTargetState> => ({
  key: `outlaw-active-targets-${minimumTargets}-${ACTIVE_TARGET_WINDOW}`,
  init: ({ playerId }) => ({ playerId, targets: new Map() }),
  update: (state, event) => {
    const next = new Map(
      Array.from(state.targets.entries()).filter(
        ([, timestamp]) => event.timestamp - timestamp <= ACTIVE_TARGET_WINDOW,
      ),
    );

    if (
      event.type === EventType.Damage &&
      event.sourceIsFriendly &&
      event.sourceID === state.playerId &&
      HasTarget(event) &&
      !event.targetIsFriendly &&
      event.targetID
    ) {
      next.set(`${event.targetID}:${event.targetInstance ?? 0}`, event.timestamp);
    }

    return { ...state, targets: next };
  },
  validate: (state) => state.targets.size >= minimumTargets,
  describe: (tense) => (
    <>
      you {tenseAlt(tense, 'are', 'were')} recently damaging {minimumTargets}+ targets
    </>
  ),
});

const adrenalineRushCondition = () =>
  and(
    buffMissing(TALENTS.ADRENALINE_RUSH_TALENT),
    fightTimeRemaining(ADRENALINE_RUSH_MIN_REMAINING_FIGHT_TIME),
    or(missingTalent(TALENTS.IMPROVED_ADRENALINE_RUSH_TALENT), belowFinisherThreshold()),
  );

/** SimC's `buff.blade_flurry.remains<gcd`; the duration depends on Dancing Steel. */
const bladeFlurryExpiringWithinGcd = (): Condition<{
  appliedAt: number | null;
  duration: number;
}> => ({
  key: 'outlaw-blade-flurry-expiring-within-gcd',
  init: ({ combatant }) => ({
    appliedAt: null,
    duration: combatant.hasTalent(TALENTS.DANCING_STEEL_TALENT)
      ? BLADE_FLURRY_DANCING_STEEL_DURATION
      : BLADE_FLURRY_BASE_DURATION,
  }),
  update: (state, event) => {
    if (!HasAbility(event) || event.ability.guid !== SPELLS.BLADE_FLURRY.id) {
      return state;
    }

    switch (event.type) {
      case EventType.ApplyBuff:
      case EventType.RefreshBuff:
        return { ...state, appliedAt: event.timestamp };
      case EventType.RemoveBuff:
        return { ...state, appliedAt: null };
    }

    return state;
  },
  validate: (state, event) =>
    state.appliedAt !== null && state.appliedAt + state.duration - event.timestamp <= BASE_GCD,
  describe: (tense) => (
    <>
      <SpellLink spell={SPELLS.BLADE_FLURRY} /> {tenseAlt(tense, 'is', 'was')} about to expire
    </>
  ),
});

// SimC: `blade_flurry,if=spell_targets>=2&buff.blade_flurry.remains<gcd`
const bladeFlurryCondition = () =>
  or(
    and(activeTargets(2), or(buffMissing(SPELLS.BLADE_FLURRY), bladeFlurryExpiringWithinGcd())),
    targetsHit(
      { atLeast: 2 },
      {
        targetType: EventType.Damage,
      },
    ),
  );

// SimC: `blade_flurry,if=talent.deft_maneuvers&spell_targets>=3`, as a builder not a buff.
const deftManeuversBladeFlurryCondition = () =>
  and(hasTalent(TALENTS.DEFT_MANEUVERS_TALENT), activeTargets(3));

const bladeRushCondition = () =>
  or(
    describe(has2PieceByTier(TIERS.MID1), () => <>you have the tier set 2-piece bonus</>),
    targetsHit(
      { atLeast: 2 },
      {
        targetType: EventType.Damage,
      },
    ),
  );

const OPPORTUNITY_MAX_STACKS_WITH_FAN_THE_HAMMER = 6;

const fanTheHammerHighStacks = () =>
  and(
    hasTalent(TALENTS.FAN_THE_HAMMER_TALENT),
    buffPresent(SPELLS.OPPORTUNITY),
    or(
      buffStacks(SPELLS.OPPORTUNITY, { atLeast: OPPORTUNITY_MAX_STACKS_WITH_FAN_THE_HAMMER }),
      buffRemaining(SPELLS.OPPORTUNITY, OPPORTUNITY_DURATION, { atMost: 2000 }),
    ),
  );

const fanTheHammerSafePistolShot = () =>
  and(
    hasTalent(TALENTS.FAN_THE_HAMMER_TALENT),
    buffPresent(SPELLS.OPPORTUNITY),
    fanTheHammerComboPointDeficit(),
    or(
      hasResource(RESOURCE_TYPES.COMBO_POINTS, { atLeast: 2 }, undefined, true),
      rollTheBonesCount(2, 'lessThan'),
      missingTalent(TALENTS.DEAL_FATE_TALENT),
    ),
  );

const nonFanTheHammerPistolShot = () =>
  and(
    missingTalent(TALENTS.FAN_THE_HAMMER_TALENT),
    buffPresent(SPELLS.OPPORTUNITY),
    or(
      comboPointDeficitAtMost(1),
      hasTalent(TALENTS.QUICK_DRAW_TALENT),
      and(hasTalent(TALENTS.AUDACITY_TALENT), buffMissing(SPELLS.AUDACITY_TALENT_BUFF)),
    ),
  );

const betweenTheEyesCondition = () =>
  and(
    hasResource(RESOURCE_TYPES.ENERGY, { atLeast: BETWEEN_THE_EYES_ENERGY_COST }, undefined, true),
    finisherComboPointCondition(),
    or(
      spellCooldownRemaining(TALENTS.ADRENALINE_RUSH_TALENT, {
        atLeast: BETWEEN_THE_EYES_ADRENALINE_RUSH_HOLD_WINDOW,
      }),
      adrenalineRushActive(),
      missingTalent(TALENTS.SUPERCHARGER_TALENT),
      missingTalent(TALENTS.ZERO_IN_TALENT),
    ),
  );

// Uses the same buff model as the `buffMissing` check in `adrenalineRushCondition`, so the two
// cannot disagree about whether Adrenaline Rush is up.
const adrenalineRushActive = () => buffPresent(TALENTS.ADRENALINE_RUSH_TALENT);

// Between the Eyes' cooldown is tracked by SpellUsable, so this inherits the Restless Blades
// reduction modelled in core/RestlessBlades.ts — including Supercharger, Forced Induction, the Coup
// de Grace bonus and the Roll the Bones stage 3+ multiplier. SimC calls this
// `cooldown.between_the_eyes.ready`.
const betweenTheEyesAvailable = () => spellAvailable(SPELLS.BETWEEN_THE_EYES);

const vanishCondition = () =>
  and(
    hasTalent(TALENTS.HIDDEN_OPPORTUNITY_TALENT),
    belowFinisherThreshold(),
    buffMissing(SPELLS.AUDACITY_TALENT_BUFF),
    buffMissing(SPELLS.OPPORTUNITY),
  );

// SimC: `preparation,if=cooldown.adrenaline_rush.remains>30&!cooldown.between_the_eyes.ready|fight_remains<30`
const preparationCondition = () =>
  and(
    hasTalent(TALENTS.PREPARATION_TALENT),
    spellAvailable(SPELLS.PREPARATION),
    or(
      and(
        spellCooldownRemaining(TALENTS.ADRENALINE_RUSH_TALENT, {
          atLeast: PREPARATION_ADRENALINE_RUSH_WINDOW,
        }),
        betweenTheEyesOnCooldown(),
      ),
      fightEndingWithin(PREPARATION_FIGHT_REMAINS_WINDOW),
    ),
  );

const COOLDOWNS: Rule[] = [
  {
    spell: TALENTS.ADRENALINE_RUSH_TALENT,
    condition: adrenalineRushCondition(),
  },
  {
    spell: SPELLS.BLADE_FLURRY,
    condition: bladeFlurryCondition(),
  },
  {
    spell: SPELLS.PREPARATION,
    condition: optionalRule(
      preparationCondition(),
      <>
        SimulationCraft uses <SpellLink spell={SPELLS.PREPARATION} /> as soon as its reset has
        value. WoWAnalyzer treats this as positive-only: holding it for a planned pull or a boss is
        a judgement call a log cannot second-guess, so a real cast is credited but one is never
        demanded. The Cooldowns section reports how many were available instead.
      </>,
      '',
    ),
  },
  {
    spell: TALENTS.KEEP_IT_ROLLING_TALENT,
    condition: optionalRule(
      and(hasTalent(TALENTS.KEEP_IT_ROLLING_TALENT), rollTheBonesCount(3, 'atLeast')),
      <>
        SimulationCraft uses <SpellLink spell={TALENTS.KEEP_IT_ROLLING_TALENT} /> at strong{' '}
        <SpellLink spell={SPELLS.ROLL_THE_BONES} /> stages. Dedicated Keep it Rolling analysis
        handles stage quality and missed windows.
      </>,
      '',
    ),
  },
  {
    spell: SPELLS.ROLL_THE_BONES,
    condition: rollTheBonesCondition(),
  },
  {
    spell: TALENTS.BLADE_RUSH_TALENT,
    condition: optionalRule(
      and(hasTalent(TALENTS.BLADE_RUSH_TALENT), bladeRushCondition()),
      <>
        SimulationCraft uses <SpellLink spell={TALENTS.BLADE_RUSH_TALENT} /> based on set bonus,
        target count, and energy time-to-cap. WoWAnalyzer treats this as positive-only because
        energy pooling and future target availability are not reliable in the APL checker.
      </>,
      '',
    ),
  },
  {
    spell: SPELLS.VANISH,
    condition: vanishCondition(),
  },
];

const FINISHERS: Rule[] = [
  {
    spell: SPELLS.BETWEEN_THE_EYES,
    condition: betweenTheEyesCondition(),
  },
  {
    // SimC's `killing_spree` just follows Between the Eyes; the ordered scan handles precedence.
    spell: TALENTS.KILLING_SPREE_TALENT,
    condition: and(
      hasTalent(TALENTS.KILLING_SPREE_TALENT),
      hasResource(RESOURCE_TYPES.ENERGY, { atLeast: KILLING_SPREE_ENERGY_COST }, undefined, true),
      finisherComboPointCondition(),
    ),
  },
  {
    spell: SPELLS.COUP_DE_GRACE_CAST,
    condition: optionalRule(
      castWasMade(
        <>
          <SpellLink spell={SPELLS.COUP_DE_GRACE_CAST} /> was cast
        </>,
      ),
      <>
        SimulationCraft models <SpellLink spell={SPELLS.COUP_DE_GRACE_CAST} /> through Trickster
        internal action availability. WoWAnalyzer treats actual casts as positive-only until that
        transform state can be modeled exactly.
      </>,
      '',
    ),
  },
  {
    spell: SPELLS.DISPATCH,
    condition: and(
      hasResource(RESOURCE_TYPES.ENERGY, { atLeast: DISPATCH_ENERGY_COST }, undefined, true),
      finisherComboPointCondition(),
    ),
  },
];

const BUILDERS: Rule[] = [
  {
    spell: SPELLS.AMBUSH,
    condition: and(
      hasTalent(TALENTS.HIDDEN_OPPORTUNITY_TALENT),
      buffPresent(SPELLS.AUDACITY_TALENT_BUFF, 100),
    ),
  },
  {
    spell: SPELLS.BLADE_FLURRY,
    condition: optionalRule(
      deftManeuversBladeFlurryCondition(),
      <>
        SimulationCraft uses <SpellLink spell={SPELLS.BLADE_FLURRY} /> as a combo point builder at
        3+ targets with <SpellLink spell={TALENTS.DEFT_MANEUVERS_TALENT} />. WoWAnalyzer treats this
        as positive-only: target count is estimated from recent damage, which is too unreliable in
        dungeons to demand a cast — the same reason <SpellLink spell={TALENTS.BLADE_RUSH_TALENT} />{' '}
        is positive-only.
      </>,
      '',
    ),
  },
  {
    spell: SPELLS.PISTOL_SHOT,
    condition: and(
      hasTalent(TALENTS.AUDACITY_TALENT),
      hasTalent(TALENTS.HIDDEN_OPPORTUNITY_TALENT),
      buffPresent(SPELLS.OPPORTUNITY),
      buffMissing(SPELLS.AUDACITY_TALENT_BUFF),
    ),
  },
  {
    spell: SPELLS.PISTOL_SHOT,
    condition: fanTheHammerHighStacks(),
  },
  {
    spell: SPELLS.PISTOL_SHOT,
    condition: fanTheHammerSafePistolShot(),
  },
  {
    spell: SPELLS.PISTOL_SHOT,
    condition: nonFanTheHammerPistolShot(),
  },
  {
    spell: SPELLS.AMBUSH,
    condition: and(hasTalent(TALENTS.HIDDEN_OPPORTUNITY_TALENT), ambushAvailable()),
  },
  SPELLS.SINISTER_STRIKE,
];

export const outlaw_rotation = build([...COOLDOWNS, ...FINISHERS, ...BUILDERS]);
