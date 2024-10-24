import aplCheck, { build } from 'parser/shared/metrics/apl';
import TALENTS from 'common/TALENTS/mage';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import * as apl from './FrostAplCommons';

const precastFrostfireBolt = cnd.lastSpellCast(TALENTS.FROSTFIRE_BOLT_TALENT);
const excessFrost = cnd.buffPresent(TALENTS.EXCESS_FROST_TALENT);

const flurryFfCondition = cnd.or(
  cnd.and(
    cnd.debuffMissing(SPELLS.WINTERS_CHILL),
    cnd.or(precastFrostfireBolt, apl.precastGlacialSpike),
  ),
  excessFrost,
);

const flurryFfDescription = (
  <>
    either:
    <ul>
      <li>
        no <SpellLink spell={SPELLS.WINTERS_CHILL} /> on target and precasted (
        <SpellLink spell={TALENTS.FROSTFIRE_BOLT_TALENT} /> or{' '}
        <SpellLink spell={TALENTS.GLACIAL_SPIKE_TALENT} />)
      </li>
      <li>
        have <SpellLink spell={TALENTS.EXCESS_FROST_TALENT} />
      </li>
    </ul>
  </>
);

export const frostfireApl = build([
  {
    spell: TALENTS.GLACIAL_SPIKE_TALENT,
    condition: cnd.and(apl.fiveIcicles, apl.canShatter),
  },
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: cnd.describe(flurryFfCondition, (tense) => flurryFfDescription),
  },
  {
    spell: TALENTS.ICE_LANCE_TALENT,
    condition: cnd.or(apl.wintersChill, apl.fingersOfFrost),
  },
  TALENTS.FROSTFIRE_BOLT_TALENT,
]);

export const frostfireCheck = aplCheck(frostfireApl);
