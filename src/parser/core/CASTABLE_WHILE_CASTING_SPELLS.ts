import SPELLS from 'common/SPELLS';

const spells: number[] = [
  /**
   * This consists of spells that are able to be cast while casting. This is
   * primarily used to ignore the below spells when determining whether a
   * spell cast was cancelled since these do not interrupt casting.
   */
  SPELLS.FIRE_BLAST.id,
  SPELLS.COMBUSTION.id,
];

export default spells;
