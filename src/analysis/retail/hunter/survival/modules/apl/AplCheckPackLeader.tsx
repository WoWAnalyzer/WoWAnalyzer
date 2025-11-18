import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { build, CheckResult, PlayerInfo, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';

const withTip = cnd.buffPresent(SPELLS.TIP_OF_THE_SPEAR_CAST);
export const apl = build([
  {
    spell: TALENTS.KILL_COMMAND_SURVIVAL_TALENT,
    condition: cnd.or(
      cnd.buffPresent(SPELLS.HOWL_OF_THE_PACKLEADER_WYVERN),
      cnd.buffPresent(SPELLS.HOWL_OF_THE_PACKLEADER_BEAR),
      cnd.buffPresent(SPELLS.HOWL_OF_THE_PACKLEADER_BOAR),
    ),
    description: (
      <>
        Cast <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} /> when you have a Beast ready
      </>
    ),
  },
  {
    spell: SPELLS.FLANKING_STRIKE_PLAYER,
    condition: cnd.describe(
      cnd.and(withTip, cnd.not(cnd.spellAvailable(TALENTS.COORDINATED_ASSAULT_TALENT))),
      (tense) => (
        <>you {tenseAlt(tense, <>have</>, <>had</>)} at least 1 stack of Tip of the Spear</>
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
      cnd.and(cnd.spellFractionalCharges(SPELLS.WILDFIRE_BOMB_IMPACT, { atLeast: 1.5 }), withTip),
      (tense) => (
        <>
          {' '}
          you {tenseAlt(tense, <>have</>, <>had</>)} at least 1 stack of Tip and {'>'} 1.5 charges
        </>
      ),
    ),
  },
  {
    spell: TALENTS.MONGOOSE_BITE_TALENT,
    condition: cnd.describe(
      cnd.or(
        cnd.buffSoonPresent(SPELLS.HOWL_OF_THE_PACKLEADER_BEAR, { atLeast: 100, atMost: 1000 }),
        cnd.buffSoonPresent(SPELLS.HOWL_OF_THE_PACKLEADER_WYVERN, { atLeast: 100, atMost: 1000 }),
        cnd.buffSoonPresent(SPELLS.HOWL_OF_THE_PACKLEADER_BOAR, { atLeast: 100, atMost: 1000 }),
      ),
      (tense) => <> you {tenseAlt(tense, <>have</>, <>had</>)} a Beast ready soon</>,
    ),
  },

  {
    spell: TALENTS.KILL_COMMAND_SURVIVAL_TALENT,
    condition: cnd.describe(cnd.hasResource(RESOURCE_TYPES.FOCUS, { atMost: 77 }), (tense) => (
      <>you {tenseAlt(tense, <>won't</>, <>won't</>)} overcap Focus</>
    )),
  },
  TALENTS.MONGOOSE_BITE_TALENT,
  {
    spell: TALENTS.KILL_SHOT_SURVIVAL_TALENT,
    condition: cnd.describe(
      cnd.and(cnd.hasResource(RESOURCE_TYPES.FOCUS, { atMost: 30 })),
      (tense) => <>you {tenseAlt(tense, <>have</>, <>had</>)} low Focus</>,
    ),
  },
  {
    spell: TALENTS.EXPLOSIVE_SHOT_TALENT,
    condition: cnd.describe(
      cnd.and(cnd.hasResource(RESOURCE_TYPES.FOCUS, { atMost: 30 })),
      (tense) => <>you {tenseAlt(tense, <>have</>, <>had</>)} low Focus</>,
    ),
  },
]);

export const checkApl = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl);
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = checkApl(events, info);
  annotateTimeline(violations);
  return undefined;
});
