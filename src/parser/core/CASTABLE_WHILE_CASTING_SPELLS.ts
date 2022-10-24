import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';

const spells: number[] = [
  /**
   * This consists of spells that are able to be cast while casting. This is
   * primarily used to ignore the below spells when determining whether a
   * spell cast was cancelled since these do not interrupt casting.
   */
  SPELLS.FIRE_BLAST.id,
  TALENTS.COMBUSTION_TALENT.id,
];

export default spells;
