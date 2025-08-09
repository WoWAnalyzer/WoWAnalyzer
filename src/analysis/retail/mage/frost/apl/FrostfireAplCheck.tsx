import aplCheck, { build } from 'parser/shared/metrics/apl';
import TALENTS from 'common/TALENTS/mage';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS';
import * as apl from './FrostAplCommons';

const lessThanThreeIcicles = cnd.buffStacks(SPELLS.ICICLES_BUFF, { atMost: 3 });
const precastFrostfireBolt = cnd.lastSpellCast(TALENTS.FROSTFIRE_BOLT_TALENT);

const flurryFfbCsCondition = cnd.and(
  lessThanThreeIcicles,
  cnd.debuffMissing(SPELLS.WINTERS_CHILL),
  precastFrostfireBolt,
);

export const frostfireApl = build([
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: apl.precastGlacialSpikeAndNoWintersChill,
  },
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: flurryFfbCsCondition,
  },
  {
    spell: TALENTS.GLACIAL_SPIKE_TALENT,
    condition: cnd.and(apl.fiveIcicles),
  },
  {
    spell: TALENTS.ICE_LANCE_TALENT,
    condition: cnd.or(apl.wintersChill, apl.fingersOfFrost),
  },
  TALENTS.FROSTFIRE_BOLT_TALENT,
]);

export const frostfireCheck = aplCheck(frostfireApl);

export const boltspamFrostfireApl = build([
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: flurryFfbCsCondition,
  },
  {
    spell: TALENTS.GLACIAL_SPIKE_TALENT,
    condition: cnd.and(apl.fiveIcicles),
  },
  {
    spell: TALENTS.ICE_LANCE_TALENT,
    condition: cnd.and(apl.precastGlacialSpike, apl.fingersOfFrost),
  },
  {
    spell: TALENTS.ICE_LANCE_TALENT,
    condition: cnd.and(
      cnd.buffStacks(SPELLS.ICICLES_BUFF, { atLeast: 4, atMost: 4 }),
      cnd.debuffStacks(SPELLS.WINTERS_CHILL, { atLeast: 2 }),
    ),
  },
  TALENTS.FROSTFIRE_BOLT_TALENT,
]);

export const boltspamFrostfireCheck = aplCheck(boltspamFrostfireApl);
