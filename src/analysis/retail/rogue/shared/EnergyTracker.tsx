import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/rogue';

const BASE_MAX_ENERGY = 100;
const VIGOR_ENERGY_PER_RANK = 50;
const BASE_REGEN = 10;
const VIGOR_REGEN_MULT_PER_RANK = 0.1;

class EnergyTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
  };

  baseRegen: number;
  vigorRegen: number;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.ENERGY;

    this.baseRegen = BASE_REGEN;
    this.vigorRegen =
      1 + this.selectedCombatant.getTalentRank(TALENTS.VIGOR_TALENT) * VIGOR_REGEN_MULT_PER_RANK;
    this.maxResource =
      BASE_MAX_ENERGY +
      this.selectedCombatant.getTalentRank(TALENTS.VIGOR_TALENT) * VIGOR_ENERGY_PER_RANK;
    this.baseRegenRate = this.baseRegen * this.vigorRegen;

    this.refundOnMiss = true;
  }
}

export default EnergyTracker;
