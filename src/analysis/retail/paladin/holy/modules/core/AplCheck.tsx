import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import { getWordofGlorySpell } from 'analysis/retail/paladin/shared/constants';

const HOLY_POWER_CAP = 5;
const SPENDER_COST = 3;

/**
 * Holy Paladin is a reactive healer, so this is a priority list rather than a rotation.
 * It describes what to press when nothing more urgent is happening -- it cannot know that
 * you held a global to react to incoming damage, so treat the violations as prompts to
 * look at a moment rather than as mistakes on their own.
 */
export const apl = (info: PlayerInfo): Apl => {
  const spender = getWordofGlorySpell(info.combatant);

  const atCap = cnd.describe(
    cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: HOLY_POWER_CAP }),
    (tense) => <>you {tenseAlt(tense, 'are', 'were')} capped on Holy Power</>,
  );

  const canSpend = cnd.describe(
    cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: SPENDER_COST }),
    (tense) => <>you {tenseAlt(tense, 'have', 'had')} enough Holy Power to spend</>,
  );

  const hasInfusion = cnd.describe(cnd.buffPresent(SPELLS.INFUSION_OF_LIGHT), (tense) => (
    <>
      you {tenseAlt(tense, 'have', 'had')} an <SpellLink spell={SPELLS.INFUSION_OF_LIGHT} /> proc
    </>
  ));

  return build([
    // Capping wastes everything you generate afterwards, so this outranks the cooldown.
    {
      spell: [spender, TALENTS.LIGHT_OF_DAWN_TALENT, SPELLS.SHIELD_OF_THE_RIGHTEOUS_HOLY],
      condition: atCap,
    },
    TALENTS.DIVINE_TOLL_TALENT,
    {
      spell: SPELLS.FLASH_OF_LIGHT,
      condition: hasInfusion,
    },
    TALENTS.HOLY_SHOCK_TALENT,
    {
      spell: [spender, TALENTS.LIGHT_OF_DAWN_TALENT, SPELLS.SHIELD_OF_THE_RIGHTEOUS_HOLY],
      condition: canSpend,
    },
    SPELLS.FLASH_OF_LIGHT,
  ]);
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
