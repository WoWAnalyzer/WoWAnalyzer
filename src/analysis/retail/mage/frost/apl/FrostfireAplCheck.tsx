import aplCheck, { build } from 'parser/shared/metrics/apl';
import TALENTS from 'common/TALENTS/mage';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import * as apl from './FrostAplCommons';

// flurry,if=buff.icicles.react<5&remaining_winters_chill=0&debuff.winters_chill.down&prev_gcd.1.glacial_spike
// flurry,if=buff.icicles.react<5&remaining_winters_chill=0&debuff.winters_chill.down&prev_gcd.1.comet_storm
// flurry,if=buff.icicles.react<5&remaining_winters_chill=0&debuff.winters_chill.down&prev_gcd.1.frostfire_bolt
// flurry,if=buff.icicles.react<5&remaining_winters_chill=0&debuff.winters_chill.down&buff.excess_frost.react=2
// flurry,if=buff.icicles.react<5&buff.brain_freeze.react&buff.excess_fire.react

// 1. Flurry when (!WC and (after FFb/GS/CS or at 2 ExFr)) or BF+ExFi
// 2. GS
// 3. IL with FoF or WC
// 4. FFb

const lessThanFourIcicles = cnd.buffStacks(SPELLS.ICICLES_BUFF, { atMost: 4 });
const precastFrostfireBolt = cnd.lastSpellCast(TALENTS.FROSTFIRE_BOLT_TALENT);
const precastCommetStorm = cnd.lastSpellCast(TALENTS.COMET_STORM_TALENT);
const excessFrostTwoStacks = cnd.buffStacks(SPELLS.EXCESS_FROST_BUFF, { atLeast: 2 });
const excessFire = cnd.buffPresent(SPELLS.EXCESS_FIRE_BUFF);
const brainFreeze = cnd.buffPresent(TALENTS.BRAIN_FREEZE_TALENT);

const flurryFfCondition = cnd.or(
  cnd.and(cnd.debuffMissing(SPELLS.WINTERS_CHILL), apl.precastGlacialSpike),
  cnd.and(
    lessThanFourIcicles,
    cnd.or(
      cnd.and(
        cnd.debuffMissing(SPELLS.WINTERS_CHILL),
        cnd.or(
          precastFrostfireBolt,
          apl.precastGlacialSpike,
          precastCommetStorm,
          excessFrostTwoStacks,
        ),
      ),
      cnd.and(excessFire, brainFreeze),
    ),
  ),
);

const flurryFfDescription = (
  <>
    you have less than 4 <SpellLink spell={SPELLS.ICICLES_BUFF} /> and either:
    <ul>
      <li>
        no <SpellLink spell={SPELLS.WINTERS_CHILL} /> on target and just cast{' '}
        <SpellLink spell={TALENTS.FROSTFIRE_BOLT_TALENT} />,{' '}
        <SpellLink spell={TALENTS.GLACIAL_SPIKE_TALENT} /> or{' '}
        <SpellLink spell={TALENTS.COMET_STORM_TALENT} />
      </li>
      <li>
        no <SpellLink spell={SPELLS.WINTERS_CHILL} /> on target and have 2 stacks of{' '}
        <SpellLink spell={SPELLS.EXCESS_FROST_BUFF} />
      </li>
      <li>
        or have <SpellLink spell={SPELLS.EXCESS_FIRE_BUFF} /> and{' '}
        <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} />
      </li>
    </ul>
  </>
);

export const frostfireApl = build([
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: cnd.describe(flurryFfCondition, (tense) => flurryFfDescription),
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
