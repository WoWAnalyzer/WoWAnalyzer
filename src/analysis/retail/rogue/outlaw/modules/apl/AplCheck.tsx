import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, {
  Apl,
  build,
  CheckResult,
  PlayerInfo,
  Rule,
  tenseAlt,
} from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/rogue';
import {
  and,
  buffMissing,
  buffPresent,
  hasResource,
  or,
  describe,
  buffStacks,
  optionalRule,
  hasTalent,
  lastSpellCast,
  always,
  buffSoonPresent,
} from 'parser/shared/metrics/apl/conditions';

import { AnyEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { ROLL_THE_BONES_BUFFS } from '../../constants';
import { buffsCount } from './buffsCount';
import { betweenTheEyesMissing } from './betweenTheEyesMissing';

/*
 * TODO:
 * Due to how resource events are batched, eg. you press a builder, you get the resource event,
 * before the cast event, cp ruling can be a bit off sometimes.
 * Ideally we'd just grab the proper values using this.comboPointTracker.resourceUpdates.at(-1)
 * but until APLCheck is turned into a proper analyzer, we can't do that.
 */

const hasFinisherCondition = (usePrevAmount?: boolean) => {
  //             this should be using: finishers.recommendedFinisherPoints()
  return describe(
    hasResource(RESOURCE_TYPES.COMBO_POINTS, { atLeast: 6 }, undefined, usePrevAmount),
    (tense) => <>the finisher condition {tenseAlt(tense, 'is', 'was')} met</>,
  );
};

const rtbCondition = () => {
  return buffsCount(ROLL_THE_BONES_BUFFS, 5, 'lessThan');
};

const rtbKirCondition = () => {
  return or(
    buffsCount(ROLL_THE_BONES_BUFFS, 3, 'lessThan'),
    // Could be cast another cast over due to OGCD spells etc, so we we just wrap it in always
    always(lastSpellCast(TALENTS.KEEP_IT_ROLLING_TALENT)),
  );
};

const notInStealthCondition = () => {
  return describe(
    and(
      buffMissing(SPELLS.SUBTERFUGE_BUFF),
      buffMissing(SPELLS.STEALTH_BUFF),
      buffMissing(SPELLS.VANISH_BUFF),
    ),
    (tense) => <>you {tenseAlt(tense, 'are', 'were')} not in stealth stance</>,
  );
};

const COMMON_COOLDOWN: Rule[] = [
  //Looks like the energy gained by tea is registered before the cast, so the casts are all flaged as if you used the spell at max energy
  // {
  //   spell: TALENTS.THISTLE_TEA_TALENT,
  //   condition: describe(hasResource(RESOURCE_TYPES.ENERGY, { atMost: 60 }), (tense) => (
  //     <>you {tenseAlt(tense, 'are', 'were')} under 50 energy</>
  //   )),
  // },
  TALENTS.ADRENALINE_RUSH_TALENT,
  //TALENTS.GHOSTLY_STRIKE_TALENT,
  /* {
    spell: TALENTS.BLADE_RUSH_TALENT,
    condition: describe(energyCondition(60, 85), (tense) => (
      <>you {tenseAlt(tense, 'are', 'were')} under ~70/80 energy</>
    )),
  }, */
  {
    spell: TALENTS.KILLING_SPREE_TALENT,
    condition: and(
      hasFinisherCondition(true),
      describe(
        and(
          buffSoonPresent(SPELLS.SUBTERFUGE_BUFF, { atLeast: 1_000 }),
          buffMissing(SPELLS.SUBTERFUGE_BUFF),
        ),
        (tense) => (
          <>
            <SpellLink spell={SPELLS.SUBTERFUGE_BUFF} /> {tenseAlt(tense, 'is', 'was')} missing
          </>
        ),
      ),
    ),
  },
  {
    spell: SPELLS.COUP_DE_GRACE_CAST,
    condition: and(
      describe(
        and(
          buffStacks(SPELLS.COUP_DE_GRACE_BUFF, { atLeast: 4 }),
          hasResource(RESOURCE_TYPES.COMBO_POINTS, { atLeast: 5 }, undefined, true),
        ),
        (tense) => <>you {tenseAlt(tense, 'have', 'had')} at least 5 combo points</>,
      ),
      buffMissing(SPELLS.SUBTERFUGE_BUFF),
    ),
  },
  {
    spell: SPELLS.VANISH,
    condition: and(
      buffPresent(TALENTS.ADRENALINE_RUSH_TALENT),
      hasFinisherCondition(),
      notInStealthCondition(),
    ),
  },
];

const COMMON_FINISHER: Rule[] = [
  {
    spell: SPELLS.BETWEEN_THE_EYES,
    condition: and(
      hasFinisherCondition(true),
      describe(
        and(
          buffMissing(TALENTS.GREENSKINS_WICKERS_TALENT),
          hasTalent(TALENTS.GREENSKINS_WICKERS_TALENT),
        ),
        (tense) => (
          <>
            <SpellLink spell={TALENTS.GREENSKINS_WICKERS_TALENT} /> buff{' '}
            {tenseAlt(tense, 'is', 'was')} missing
          </>
        ),
      ),
    ),
  },
  {
    spell: SPELLS.BETWEEN_THE_EYES,
    condition: and(
      buffPresent(SPELLS.SUBTERFUGE_BUFF),
      hasResource(RESOURCE_TYPES.COMBO_POINTS, { atLeast: 5 }, undefined, true),
    ),
  },
  {
    spell: SPELLS.BETWEEN_THE_EYES,
    condition: and(
      describe(
        and(
          hasFinisherCondition(true),
          //We allow the user to not press BtE when in dance
        ),
        (tense) => <>the finisher condition {tenseAlt(tense, 'is', 'was')} met</>,
      ),
      or(buffPresent(SPELLS.RUTHLESS_PRECISION), betweenTheEyesMissing()),
    ),
  },
  {
    spell: SPELLS.SLICE_AND_DICE,
    condition: and(
      describe(
        and(
          hasFinisherCondition(true),
          //We allow the user to not press SnD when GM buff is present
          or(buffMissing(SPELLS.GRAND_MELEE), optionalRule(buffPresent(SPELLS.GRAND_MELEE))),
        ),
        (tense) => <>the finisher condition {tenseAlt(tense, 'is', 'was')} met</>,
      ),
      buffMissing(SPELLS.SLICE_AND_DICE, {
        timeRemaining: 18000,
        //Since SnD as a variable duration depending on cp spent this is inacurate for now
        duration: 45000,
        pandemicCap: 1.3,
      }),
    ),
  },
  {
    spell: SPELLS.DISPATCH,
    condition: hasFinisherCondition(true),
  },
];

const keep_it_rolling_rotation = build([
  {
    spell: TALENTS.KEEP_IT_ROLLING_TALENT,
    condition: buffsCount(ROLL_THE_BONES_BUFFS, 4, 'atLeast'),
  },
  {
    spell: SPELLS.ROLL_THE_BONES,
    condition: rtbKirCondition(),
  },

  ...COMMON_COOLDOWN,
  ...COMMON_FINISHER,

  {
    spell: SPELLS.PISTOL_SHOT,
    condition: and(
      buffPresent(SPELLS.OPPORTUNITY),
      describe(
        and(
          buffMissing(SPELLS.BROADSIDE),
          hasResource(RESOURCE_TYPES.COMBO_POINTS, { atMost: 3 }, undefined, true),
        ),
        (tense) => <>you {tenseAlt(tense, 'have', 'had')} at most 3 combo points</>,
      ),
    ),
  },
  {
    spell: SPELLS.PISTOL_SHOT,
    condition: and(
      buffPresent(SPELLS.OPPORTUNITY),
      buffPresent(SPELLS.BROADSIDE),
      hasResource(RESOURCE_TYPES.COMBO_POINTS, { atMost: 1 }, undefined, true),
    ),
  },
  SPELLS.SINISTER_STRIKE,
]);

const hidden_opportunity_rotation = build([
  {
    spell: SPELLS.ROLL_THE_BONES,
    condition: rtbCondition(),
  },

  ...COMMON_COOLDOWN,
  ...COMMON_FINISHER,

  {
    spell: SPELLS.AMBUSH,
    condition: or(
      // we add a 100ms offset to prevent pistol shots proccing audacity from being flagged incorrectly
      buffPresent(SPELLS.AUDACITY_TALENT_BUFF, 100),
      describe(
        or(
          buffPresent(SPELLS.SUBTERFUGE_BUFF),
          buffPresent(SPELLS.STEALTH_BUFF),
          buffPresent(SPELLS.VANISH_BUFF),
        ),
        (tense) => <>you {tenseAlt(tense, 'are', 'were')} in stealth stance</>,
      ),
    ),
  },

  {
    spell: SPELLS.PISTOL_SHOT,
    condition: buffPresent(SPELLS.OPPORTUNITY),
  },
  SPELLS.SINISTER_STRIKE,
]);

export const apl = (info: PlayerInfo): Apl => {
  if (!info) {
    return hidden_opportunity_rotation;
  }

  if (info.combatant.hasTalent(TALENTS.KEEP_IT_ROLLING_TALENT)) {
    return keep_it_rolling_rotation;
  }

  return hidden_opportunity_rotation;
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);
  return undefined;
});
