import aplCheck, { build } from 'parser/shared/metrics/apl';
import TALENTS from 'common/TALENTS/mage';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import * as apl from './FrostAplCommons';

const flurrySsCondition = cnd.and(
  cnd.debuffMissing(SPELLS.WINTERS_CHILL),
  cnd.or(
    apl.precastFbWithThreeIcicles,
    apl.precastGlacialSpike,
    apl.fourIciclesAndNoFingersOfFrost,
  ),
);

const flurrySsDescription = (
  <>
    no <SpellLink spell={SPELLS.WINTERS_CHILL} /> on target and one of:
    <ul>
      <li>
        precasted <SpellLink spell={TALENTS.GLACIAL_SPIKE_TALENT} />
      </li>
      <li>
        precasted <SpellLink spell={SPELLS.FROSTBOLT} /> and have 3+{' '}
        <SpellLink spell={SPELLS.ICICLES_BUFF} /> or{' '}
        <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} />
      </li>
      <li>
        have 4 <SpellLink spell={SPELLS.ICICLES_BUFF} /> and no{' '}
        <SpellLink spell={TALENTS.FINGERS_OF_FROST_TALENT} />
      </li>
    </ul>
  </>
);

export const spellslingerApl = build([
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: cnd.describe(flurrySsCondition, (tense) => flurrySsDescription),
  },
  {
    spell: TALENTS.GLACIAL_SPIKE_TALENT,
    condition: apl.fiveIcicles,
  },
  {
    spell: TALENTS.ICE_LANCE_TALENT,
    condition: cnd.or(apl.wintersChill, apl.fingersOfFrost),
  },
  SPELLS.FROSTBOLT,
]);

export const spellslingerCheck = aplCheck(spellslingerApl);
