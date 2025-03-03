import aplCheck, { build } from 'parser/shared/metrics/apl';
import TALENTS from 'common/TALENTS/mage';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS';
import * as apl from './FrostAplCommons';

const lessThanFourIcicles = cnd.buffStacks(SPELLS.ICICLES_BUFF, { atMost: 4 });
const precastFrostfireBolt = cnd.lastSpellCast(TALENTS.FROSTFIRE_BOLT_TALENT);
const precastCommetStorm = cnd.lastSpellCast(TALENTS.COMET_STORM_TALENT);
const excessFrostTwoStacks = cnd.buffStacks(SPELLS.EXCESS_FROST_BUFF, { atLeast: 2 });
const excessFire = cnd.buffPresent(SPELLS.EXCESS_FIRE_BUFF);
const brainFreeze = cnd.buffPresent(SPELLS.BRAIN_FREEZE_BUFF);

const flurryFfbCsCondition = cnd.and(
  lessThanFourIcicles,
  cnd.debuffMissing(SPELLS.WINTERS_CHILL),
  cnd.or(precastFrostfireBolt, precastCommetStorm),
);

const flurryExFrostCondition = cnd.and(
  lessThanFourIcicles,
  cnd.debuffMissing(SPELLS.WINTERS_CHILL),
  excessFrostTwoStacks,
);

const FlurryExFireCondition = cnd.and(excessFire, brainFreeze);

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
    spell: TALENTS.FLURRY_TALENT,
    condition: flurryExFrostCondition,
  },
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: FlurryExFireCondition,
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
    spell: TALENTS.GLACIAL_SPIKE_TALENT,
    condition: cnd.and(apl.fiveIcicles),
  },
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: cnd.and(
      cnd.buffStacks(SPELLS.ICICLES_BUFF, { atMost: 4 }),
      cnd.debuffMissing(SPELLS.WINTERS_CHILL),
    ),
  },
  {
    spell: TALENTS.ICE_LANCE_TALENT,
    condition: cnd.and(
      cnd.buffPresent(SPELLS.EXCESS_FIRE_BUFF),
      cnd.buffMissing(SPELLS.BRAIN_FREEZE_BUFF),
    ),
  },
  TALENTS.FROSTFIRE_BOLT_TALENT,
]);

export const boltspamFrostfireCheck = aplCheck(boltspamFrostfireApl);
