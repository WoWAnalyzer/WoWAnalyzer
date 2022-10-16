import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import MissingDotApplyDebuffPrePull, {
  Dot,
} from 'parser/shared/normalizers/MissingDotApplyDebuffPrePull';

const DOTS = [
  {
    debuffId: SPELLS.AGONY.id,
  },
  {
    debuffId: SPELLS.CORRUPTION_DEBUFF.id,
  },
  {
    debuffId: SPELLS.UNSTABLE_AFFLICTION.id,
  },
  {
    debuffId: TALENTS.HAUNT_TALENT.id,
  },
  {
    debuffId: SPELLS.PHANTOM_SINGULARITY_DAMAGE_HEAL.id,
  },
  {
    debuffId: SPELLS.IMMOLATE_DEBUFF.id,
  },
];

class WarlockMissingDotApplyDebuffPrePull extends MissingDotApplyDebuffPrePull {
  static dots: Dot[] = DOTS;
}

export default WarlockMissingDotApplyDebuffPrePull;
