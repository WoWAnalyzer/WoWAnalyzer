import aplCheck, { build } from 'parser/shared/metrics/apl';
import TALENTS from 'common/TALENTS/mage';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS';

export const spellslingerApl = build([
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: cnd.and(
      cnd.debuffMissing(SPELLS.WINTERS_CHILL),
      cnd.or(cnd.lastSpellCast(SPELLS.FROSTBOLT), cnd.lastSpellCast(TALENTS.GLACIAL_SPIKE_TALENT)),
    ),
  },
  {
    spell: TALENTS.ICE_LANCE_TALENT,
    condition: cnd.or(
      cnd.debuffPresent(SPELLS.WINTERS_CHILL),
      cnd.buffPresent(TALENTS.FINGERS_OF_FROST_TALENT),
    ),
  },
  {
    spell: TALENTS.GLACIAL_SPIKE_TALENT,
    condition: cnd.buffStacks(SPELLS.ICICLES_BUFF, { atLeast: 5 }),
  },
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: cnd.buffPresent(TALENTS.ICY_VEINS_TALENT),
  },
  SPELLS.FROSTBOLT,
]);

export const spellslingerCheck = aplCheck(spellslingerApl);
