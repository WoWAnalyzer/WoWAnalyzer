import type Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options } from 'parser/core/Analyzer';

export interface Spender {
  spell: Spell & { maelstromCost: number };
  costReduction: number;
}

const EARTHQUAKE_SPELLS = [
  TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT,
  TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT,
];

const MAELSTROM_SPENDERS = [
  TALENTS.ELEMENTAL_BLAST_TALENT,
  TALENTS.EARTH_SHOCK_TALENT,
  ...EARTHQUAKE_SPELLS,
];

const EARTHQUAKE_SPELL_IDS = EARTHQUAKE_SPELLS.map(({ id }) => id);
const MAELSTROM_SPENDER_IDS = MAELSTROM_SPENDERS.map(({ id }) => id);

class MaelstromSpenderInfo extends Analyzer {
  maelstromSpenders: readonly Spender['spell'][] = MAELSTROM_SPENDERS;
  maelstromSpenderIds: readonly number[] = MAELSTROM_SPENDER_IDS;
  readonly hasElementalBlast: boolean;
  readonly spender: Spender;
  readonly primarySpender: Spender['spell'];
  readonly spenderCost: number;
  readonly earthShockCost: number;
  readonly elementalBlastCost: number;
  readonly earthquakeCost: number;

  private readonly hasEyeOfTheStorm: boolean;

  constructor(options: Options) {
    super(options);
    this.hasElementalBlast = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_TALENT);
    this.hasEyeOfTheStorm = this.selectedCombatant.hasTalent(TALENTS.EYE_OF_THE_STORM_TALENT);

    this.spender = this.hasElementalBlast
      ? {
          spell: TALENTS.ELEMENTAL_BLAST_TALENT,
          costReduction: this.hasEyeOfTheStorm ? 10 : 0,
        }
      : {
          spell: TALENTS.EARTH_SHOCK_TALENT,
          costReduction: this.hasEyeOfTheStorm ? 5 : 0,
        };

    this.primarySpender = this.spender.spell;
    this.spenderCost = this.primarySpender.maelstromCost - this.spender.costReduction;
    this.earthShockCost = this.getAdjustedCost(
      TALENTS.EARTH_SHOCK_TALENT.id,
      TALENTS.EARTH_SHOCK_TALENT.maelstromCost,
    );
    this.elementalBlastCost = this.getAdjustedCost(
      TALENTS.ELEMENTAL_BLAST_TALENT.id,
      TALENTS.ELEMENTAL_BLAST_TALENT.maelstromCost,
    );
    this.earthquakeCost = this.getAdjustedCost(
      TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT.id,
      TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT.maelstromCost,
    );
  }

  isEarthquake(spellId: number) {
    return EARTHQUAKE_SPELL_IDS.includes(spellId);
  }

  isMaelstromSpender(spellId: number) {
    return this.maelstromSpenderIds.includes(spellId);
  }

  getAdjustedCost(spellId: number, originalCost: number) {
    if (!this.hasEyeOfTheStorm) {
      return originalCost;
    }

    if (this.isEarthquake(spellId) || spellId === TALENTS.EARTH_SHOCK_TALENT.id) {
      return originalCost - 5;
    }

    if (spellId === TALENTS.ELEMENTAL_BLAST_TALENT.id) {
      return originalCost - 10;
    }

    return originalCost;
  }
}

export default MaelstromSpenderInfo;
