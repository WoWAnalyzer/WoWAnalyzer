import * as cnd from 'parser/shared/metrics/apl/conditions';
import TALENTS from 'common/TALENTS/mage';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import { tenseAlt } from 'parser/shared/metrics/apl';

export const precastGlacialSpike = cnd.lastSpellCast(TALENTS.GLACIAL_SPIKE_TALENT);
export const precastGlacialSpikeAndNoWintersChill = cnd.and(
  cnd.debuffMissing(SPELLS.WINTERS_CHILL),
  precastGlacialSpike,
);

export const fiveIcicles = cnd.describe(
  cnd.and(cnd.buffStacks(SPELLS.ICICLES_BUFF, { atLeast: 5 }), cnd.not(precastGlacialSpike)),
  (tense) => (
    <>
      {tenseAlt(tense, 'have', 'had')} 5 <SpellLink spell={SPELLS.ICICLES_BUFF} />
    </>
  ),
);
export const wintersChill = cnd.debuffPresent(SPELLS.WINTERS_CHILL);
export const fingersOfFrost = cnd.buffPresent(TALENTS.FINGERS_OF_FROST_TALENT);
export const flurryAvailable = cnd.spellAvailable(TALENTS.FLURRY_TALENT);

export const precastFrostbolt = cnd.lastSpellCast(SPELLS.FROSTBOLT);
export const precastFbWithThreeIcicles = cnd.and(
  precastFrostbolt,
  cnd.buffStacks(SPELLS.ICICLES_BUFF, { atLeast: 3 }),
);

export const fourIciclesAndNoFingersOfFrost = cnd.and(
  cnd.buffStacks(SPELLS.ICICLES_BUFF, { atLeast: 4, atMost: 4 }),
  cnd.buffMissing(TALENTS.FINGERS_OF_FROST_TALENT),
);

export const canShatter = cnd.describe(cnd.or(wintersChill, flurryAvailable), (tense) => (
  <>
    {tenseAlt(tense, 'can', 'could')} shatter (with <SpellLink spell={SPELLS.WINTERS_CHILL} /> or{' '}
    <SpellLink spell={TALENTS.FLURRY_TALENT} />)
  </>
));
