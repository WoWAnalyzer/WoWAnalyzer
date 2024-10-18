import * as cnd from 'parser/shared/metrics/apl/conditions';
import TALENTS from 'common/TALENTS/mage';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';

export const precastGlacialSpike = cnd.lastSpellCast(TALENTS.GLACIAL_SPIKE_TALENT);
export const fiveIcicles = cnd.describe(
  cnd.and(cnd.buffStacks(SPELLS.ICICLES_BUFF, { atLeast: 5 }), cnd.not(precastGlacialSpike)),
  (tense) => (
    <>
      have 5 <SpellLink spell={SPELLS.ICICLES_BUFF} />
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
