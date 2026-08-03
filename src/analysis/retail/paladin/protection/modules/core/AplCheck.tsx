import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink } from 'interface';
import { suggestion as buildSuggestion } from 'parser/core/Analyzer';
import aplCheck, { build, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';

const howCastable = cnd.always(
  cnd.or(cnd.inExecute(), cnd.buffPresent(TALENTS.AVENGING_WRATH_TALENT)),
);

const holCastable = cnd.always(cnd.buffPresent(SPELLS.LIGHTS_DELIVERANCE_FREE_CAST_BUFF));

export const apl = build([
  {
    spell: SPELLS.HAMMER_OF_LIGHT,
    condition: cnd.describe(holCastable, (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} <SpellLink spell={SPELLS.BLESSING_OF_DAWN} />
      </>
    )),
  },
  {
    spell: SPELLS.CONSECRATION_CAST,
    condition: cnd.optionalRule(
      cnd.buffMissing(SPELLS.CONSECRATION_BUFF, {
        duration: 12000,
        timeRemaining: 2000,
        pandemicCap: 1,
      }),
    ),
  },
  {
    spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS,
    condition: cnd.describe(
      cnd.always(
        cnd.or(
          cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: 5 }, 0),
          cnd.buffPresent(SPELLS.DIVINE_PURPOSE_BUFF),
        ),
      ),
      (tense) => (
        <>
          you {tenseAlt(tense, 'have', 'had')} 5 <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />{' '}
          to prevent overcapping
        </>
      ),
    ),
  },
  {
    spell: TALENTS.AVENGERS_SHIELD_TALENT,
    condition: cnd.hasTalent(TALENTS.BULWARK_OF_RIGHTEOUS_FURY_TALENT),
  },
  { spell: TALENTS.HAMMER_OF_WRATH_TALENT, condition: howCastable },
  SPELLS.JUDGMENT_CAST,
  {
    spell: [TALENTS.BLESSED_HAMMER_TALENT, TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT],
    condition: cnd.buffPresent(SPELLS.SHAKE_THE_HEAVENS_BUFF),
  },
  {
    spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS,
    condition: cnd.describe(
      cnd.optionalRule(
        cnd.or(
          cnd.hasResource(RESOURCE_TYPES.HOLY_POWER, { atLeast: 3 }, 0),
          cnd.buffPresent(SPELLS.DIVINE_PURPOSE_BUFF),
        ),
      ),
      (tense) => (
        <>
          it {tenseAlt(tense, 'is', 'was')} free or you {tenseAlt(tense, 'have', 'had')} 3+{' '}
          <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} />
        </>
      ),
    ),
  },
  TALENTS.AVENGERS_SHIELD_TALENT,
  [TALENTS.BLESSED_HAMMER_TALENT, TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT],
  SPELLS.CONSECRATION_CAST,
]);

export const check = aplCheck(apl);

export default buildSuggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
