import aplCheck, { build } from 'parser/shared/metrics/apl';
import TALENTS from 'common/TALENTS/mage';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import * as apl from './FrostAplCommons';

const flurrySsCondition = cnd.and(
  cnd.debuffMissing(SPELLS.WINTERS_CHILL),
  cnd.or(apl.precastFrostbolt, apl.precastGlacialSpike),
);

const flurrySsDescription = (
  <>
    no <SpellLink spell={SPELLS.WINTERS_CHILL} /> on target and one of:
    <ul>
      <li>
        precasted <SpellLink spell={TALENTS.GLACIAL_SPIKE_TALENT} />
      </li>
      <li>
        precasted <SpellLink spell={SPELLS.FROSTBOLT} />
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
    condition: cnd.and(apl.fiveIcicles, apl.canShatter),
  },
  {
    spell: SPELLS.FROSTBOLT,
    condition: cnd.and(
      cnd.hasTalent(TALENTS.DEATHS_CHILL_TALENT),
      cnd.buffRemaining(TALENTS.ICY_VEINS_TALENT, 30000, { atLeast: 8000 }),
      cnd.buffStacks(TALENTS.DEATHS_CHILL_TALENT, { atMost: 8 }),
    ),
  },
  {
    spell: TALENTS.ICE_LANCE_TALENT,
    condition: cnd.or(
      cnd.debuffStacks(SPELLS.WINTERS_CHILL, { atLeast: 2 }),
      cnd.and(apl.wintersChill, cnd.buffPresent(TALENTS.BRAIN_FREEZE_TALENT)),
    ),
  },
  SPELLS.FROSTBOLT,
]);

export const spellslingerCheck = aplCheck(spellslingerApl);
