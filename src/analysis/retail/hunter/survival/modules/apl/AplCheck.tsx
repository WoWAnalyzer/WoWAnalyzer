import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { build, CheckResult, PlayerInfo, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';
import * as cnd from 'parser/shared/metrics/apl/conditions';

const withTip = cnd.buffPresent(SPELLS.TIP_OF_THE_SPEAR_CAST);
const hasFocus = (min: number) => cnd.hasResource(RESOURCE_TYPES.FOCUS, { atLeast: min });
export const apl = build([
  {
    spell: TALENTS.KILL_COMMAND_SURVIVAL_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.hasTalent(TALENTS.RELENTLESS_PRIMAL_FEROCITY_TALENT),
        cnd.buffMissing(SPELLS.TIP_OF_THE_SPEAR_CAST),
        cnd.buffPresent(SPELLS.COORDINATED_ASSAULT_BUFF),
      ),
      (tense) => (
        <>
          you {tenseAlt(tense, 'have', 'had')} 0 tip stacks & Relentless Primal Ferocity is active
        </>
      ),
    ),
  },
  {
    spell: TALENTS.RAPTOR_STRIKE_TALENT,
    condition: cnd.describe(
      cnd.buffRemaining(SPELLS.HOWL_OF_THE_PACK_BUFF, 8000, { atMost: 1400 }, false),
      (tense) => <>Howl of the Pack is about to fade</>,
    ),
  },

  {
    spell: TALENTS.FLANKING_STRIKE_TALENT,
    condition: cnd.describe(
      cnd.buffStacks(SPELLS.TIP_OF_THE_SPEAR_CAST, { atLeast: 1, atMost: 2 }),
      (tense) => <>you {tenseAlt(tense, <>have</>, <>had</>)} 1 or 2 stacks of Tip of the Spear</>,
    ),
  },
  TALENTS.BUTCHERY_TALENT,
  {
    spell: TALENTS.KILL_SHOT_SURVIVAL_TALENT,
    condition: cnd.describe(
      cnd.and(
        hasFocus(10),
        cnd.or(cnd.buffPresent(SPELLS.DEATHBLOW_BUFF), cnd.inExecute(0.2)),
        withTip,
        cnd.hasTalent(TALENTS.CULL_THE_HERD_TALENT),
      ),
      (tense) => (
        <>you {tenseAlt(tense, <>have</>, <>had</>)} at least 1 stack of Tip of the Spear</>
      ),
    ),
  },
  {
    //Sentinel Killshot does not care about tipping.
    spell: TALENTS.KILL_SHOT_SURVIVAL_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.hasTalent(TALENTS.SENTINEL_TALENT),
        hasFocus(10),
        cnd.or(cnd.buffPresent(SPELLS.DEATHBLOW_BUFF), cnd.inExecute(0.2)),
      ),
      (tense) => <>. Do not delay for Tip of the Spear stacks.</>,
    ),
  },
  {
    spell: TALENTS.WILDFIRE_BOMB_TALENT,
    condition: cnd.describe(
      cnd.spellFractionalCharges(TALENTS.WILDFIRE_BOMB_TALENT, { atLeast: 1.9 }),

      (tense) => (
        <>
          you {tenseAlt(tense, <>have</>, <>had</>)} {'>'} 1.9 charges
        </>
      ),
    ),
  },
  {
    spell: TALENTS.WILDFIRE_BOMB_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.spellAvailable(TALENTS.COORDINATED_ASSAULT_TALENT),
        cnd.hasTalent(TALENTS.BOMBARDIER_TALENT),
      ),
      (tense) => (
        <>
          {' '}
          you {tenseAlt(tense, <>have</>, <>had</>)} Bombardier Talented & Coordinated Assault is
          Ready
        </>
      ),
    ),
  },
  {
    spell: TALENTS.WILDFIRE_BOMB_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.spellFractionalCharges(SPELLS.WILDFIRE_BOMB_IMPACT, { atLeast: 1.5, atMost: 2 }),
        withTip,
      ),
      (tense) => (
        <>
          {' '}
          you {tenseAlt(tense, <>have</>, <>had</>)} at least 1 stack of Tip and {'>'} 1.5 charges
        </>
      ),
    ),
  },
  //Explosive goes tipless now thanks to grenade juggler rework in .5
  TALENTS.EXPLOSIVE_SHOT_TALENT,
  {
    spell: TALENTS.KILL_COMMAND_SURVIVAL_TALENT,
    condition: cnd.describe(
      cnd.or(
        cnd.and(
          cnd.hasResource(RESOURCE_TYPES.FOCUS, { atMost: 77 }),
          cnd.buffMissing(SPELLS.COORDINATED_ASSAULT_BUFF),
          cnd.buffMissing(SPELLS.TIP_OF_THE_SPEAR_CAST),
          cnd.hasTalent(TALENTS.RELENTLESS_PRIMAL_FEROCITY_TALENT),
        ),
        cnd.and(
          cnd.buffPresent(SPELLS.COORDINATED_ASSAULT_BUFF),
          cnd.hasResource(RESOURCE_TYPES.FOCUS, { atMost: 30 }),
          cnd.hasTalent(TALENTS.RELENTLESS_PRIMAL_FEROCITY_TALENT),
        ),
      ),

      //kill_command,target_if=min:bloodseeker.remains,if=focus+cast_regen<focus.max&(!buff.relentless_primal_ferocity.up|(buff.relentless_primal_ferocity.up&buff.tip_of_the_spear.stack<1|focus<30))
      (tense) => (
        <>
          you {tenseAlt(tense, <>have</>, <>had</>)} at most 77 focus and don't have
          <SpellLink spell={TALENTS.RELENTLESS_PRIMAL_FEROCITY_TALENT} /> up OR you have
          <SpellLink spell={TALENTS.RELENTLESS_PRIMAL_FEROCITY_TALENT} /> with less than 30 focus.
        </>
      ),
    ),
  },

  TALENTS.RAPTOR_STRIKE_TALENT,
]);

export const aplProps = (events: AnyEvent[], info: PlayerInfo): AplRuleProps => {
  const check = aplCheck(apl);
  return {
    apl: apl,
    checkResults: check(events, info),
  };
};

export const checkApl = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl);
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = checkApl(events, info);
  annotateTimeline(violations);
  return undefined;
});
