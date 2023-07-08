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
  not,
  optionalRule,
  hasTalent,
} from 'parser/shared/metrics/apl/conditions';

import { AnyEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { ROLL_THE_BONES_BUFFS } from '../../constants';
import { buffsCount } from './buffsCount';
import { betweenTheEyesMissing } from './betweenTheEyesMissing';

//--TODO: GS can't work for now until I finish working on gs debuff eventFabricator
//        Add support for KiR builds
//        BtE and SnD having variable duration depending on cp spent make their conditions innacurate for now
//        SnD condition being rarely met it sometimes don't show in the apl if the user never casted the spell
//        Add an optional rule to allow use of Ambush at 6cp with 2p and if bte isnt going to be pressed, not sure if fully possible (0.1% minmax)
//        Thistle tea seems to not work with the energy condition as the cast happens after the energy gain
//        Fix cto + rtb edge case

const hasFinisherCondition = () => {
  //             this should be using: finishers.recommendedFinisherPoints()
  return describe(hasResource(RESOURCE_TYPES.COMBO_POINTS, { atLeast: 6 }), (tense) => (
    <>the finisher condition {tenseAlt(tense, 'is', 'was')} met</>
  ));
};

//  /!\ Not sure this is working
//  minEnergyThreshold will be the hard enforced energy rule while maxEnergyThreshold is the leeway accorded to the user
const energyCondition = (minEnergyThreshold: number, maxEnergyThreshold: number) => {
  return or(
    hasResource(RESOURCE_TYPES.ENERGY, { atMost: minEnergyThreshold }),
    optionalRule(hasResource(RESOURCE_TYPES.ENERGY, { atMost: maxEnergyThreshold })),
  );
};

//  if snc is down and rtbBuffCount < 2 should reroll, we are allowing the user to also keep a single Broadside as it is barely worse
const rtbCondition = () => {
  const rtbBuffsToCheck = ROLL_THE_BONES_BUFFS.filter((spell) => spell !== SPELLS.GRAND_MELEE);
  return and(
    describe(
      and(
        or(
          // allow rerolling if you're missing either SnC or BS, but don't require it
          optionalRule(or(buffMissing(SPELLS.SKULL_AND_CROSSBONES), buffMissing(SPELLS.BROADSIDE))),
          // require rerolling if you're missing both SnC and BS
          and(buffMissing(SPELLS.SKULL_AND_CROSSBONES), buffMissing(SPELLS.BROADSIDE)),
        ),
        // allow not rerolling during dance window
        or(
          buffMissing(SPELLS.SHADOW_DANCE_BUFF),
          optionalRule(buffPresent(SPELLS.SHADOW_DANCE_BUFF)),
        ),
        // allow not rerolling during subterfuge window
        or(buffMissing(SPELLS.SUBTERFUGE_BUFF), optionalRule(buffPresent(SPELLS.SUBTERFUGE_BUFF))),
        // same for vanish buff
        or(buffMissing(SPELLS.VANISH_BUFF), optionalRule(buffPresent(SPELLS.VANISH_BUFF))),
      ),
      (tense) => (
        <>
          <SpellLink spell={SPELLS.SKULL_AND_CROSSBONES} /> {tenseAlt(tense, 'is', 'was')} missing
        </>
      ),
    ),
    buffsCount(rtbBuffsToCheck, 2, 'lessThan'),
  );
};

const notInStealthCondition = () => {
  return describe(
    and(
      buffMissing(SPELLS.SHADOW_DANCE_BUFF),
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
  {
    spell: TALENTS.BLADE_RUSH_TALENT,
    condition: describe(energyCondition(60, 85), (tense) => (
      <>you {tenseAlt(tense, 'are', 'were')} under ~70/80 energy</>
    )),
  },
  {
    spell: TALENTS.KILLING_SPREE_TALENT,
    condition: describe(and(energyCondition(40, 65), notInStealthCondition()), (tense) => (
      <>you {tenseAlt(tense, 'are', 'were')} under ~50/60 energy</>
    )),
  },
  {
    spell: TALENTS.ROLL_THE_BONES_TALENT,
    condition: rtbCondition(),
  },
  {
    spell: SPELLS.VANISH,
    condition: and(
      buffMissing(SPELLS.AUDACITY_TALENT_BUFF),
      describe(
        and(
          //The real rule is to vanish whenever you have less than max stacks of opp, however
          //since its barely behind we also allow the user to only use vanish when opp is missing
          or(
            optionalRule(buffStacks(SPELLS.OPPORTUNITY, { atMost: 3 })),
            buffMissing(SPELLS.OPPORTUNITY),
          ),
          //This is a given no point displaying it
          notInStealthCondition(),
          //We want to allow the user to press vanish at max cp, but that is not a requirement
          or(not(hasFinisherCondition()), optionalRule(hasFinisherCondition())),
        ),
        (tense) => (
          <>
            {' '}
            you {tenseAlt(tense, 'have', 'had')} less than max stacks of{' '}
            <SpellLink spell={SPELLS.OPPORTUNITY} />
          </>
        ),
      ),
    ),
  },
  {
    spell: TALENTS.SHADOW_DANCE_TALENT,
    condition: describe(
      and(
        buffMissing(SPELLS.AUDACITY_TALENT_BUFF),
        buffMissing(SPELLS.OPPORTUNITY),
        //This is a given no point displaying it
        notInStealthCondition(),
        //We want to allow the user to press dance at max cp, but that is not a requirement
        or(not(hasFinisherCondition()), optionalRule(hasFinisherCondition())),
      ),
      (tense) => (
        <>
          <SpellLink spell={SPELLS.AUDACITY_TALENT_BUFF} /> and{' '}
          <SpellLink spell={SPELLS.OPPORTUNITY} /> {tenseAlt(tense, 'are', 'were')} missing
        </>
      ),
    ),
  },
];

const COMMON_FINISHER: Rule[] = [
  {
    spell: SPELLS.BETWEEN_THE_EYES,
    condition: and(
      hasFinisherCondition(),
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
      describe(
        and(
          hasFinisherCondition(),
          //We allow the user to not press BtE when in dance
          or(
            buffMissing(SPELLS.SHADOW_DANCE_BUFF),
            optionalRule(buffPresent(SPELLS.SHADOW_DANCE_BUFF)),
          ),
        ),
        (tense) => <>the finisher condition {tenseAlt(tense, 'is', 'was')} met</>,
      ),
      betweenTheEyesMissing(),
    ),
  },
  {
    spell: SPELLS.SLICE_AND_DICE,
    condition: and(
      describe(
        and(
          hasFinisherCondition(),
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
    condition: hasFinisherCondition(),
  },
];

export const COMMON_BUILDER: Rule[] = [
  // Commented for now as GS doesn't have an associated applyDebuff and removeDebuff event
  // {
  //   spell: TALENTS.GHOSTLY_STRIKE_TALENT,
  //   condition: and(
  //     debuffMissing(TALENTS.GHOSTLY_STRIKE_TALENT, {
  //       timeRemaining: 3000,
  //       duration: 10000,
  //       pandemicCap: 0,
  //     }),
  //     notInStealthCondition(),
  //   ),
  // },

  //This seems to not function correctly
  {
    spell: SPELLS.PISTOL_SHOT,
    condition: describe(
      optionalRule(
        and(
          buffStacks(SPELLS.OPPORTUNITY, { atLeast: 6 }),
          not(hasTalent(TALENTS.COUNT_THE_ODDS_TALENT)),
        ),
      ),
      (tense) => (
        <>
          {' '}
          you {tenseAlt(tense, 'have', 'had')} max stacks of{' '}
          <SpellLink spell={SPELLS.OPPORTUNITY} />
        </>
      ),
    ),
  },
  {
    spell: SPELLS.AMBUSH,
    condition: or(
      // we add a 100ms offset to prevent pistol shots proccing audacity from being flagged incorrectly
      buffPresent(SPELLS.AUDACITY_TALENT_BUFF, 100),
      describe(
        or(
          buffPresent(SPELLS.SHADOW_DANCE_BUFF),
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
];

const hidden_opportunity_rotation = build([
  ...COMMON_COOLDOWN,
  ...COMMON_FINISHER,
  ...COMMON_BUILDER,
]);

export const apl = (): Apl => {
  return hidden_opportunity_rotation;
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl());
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);
  return undefined;
});
