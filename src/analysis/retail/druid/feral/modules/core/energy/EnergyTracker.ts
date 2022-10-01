import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';

const BASE_MAX_ENERGY = 100;
const TE_ENERGY_PER_RANK = 30;
const BASE_REGEN = 11;
const TE_REGEN_MULT_PER_RANK = 0.1;

// TODO impl refund tracking on miss/parry
class EnergyTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.ENERGY;

    this.initBuilderAbility(SPELLS.TIGERS_FURY.id);

    const teRank = this.selectedCombatant.getTalentRank(TALENTS_DRUID.TIRELESS_ENERGY_FERAL_TALENT);
    this.maxResource = BASE_MAX_ENERGY + TE_ENERGY_PER_RANK * teRank;
    this.baseRegenRate = BASE_REGEN * (1 + TE_REGEN_MULT_PER_RANK * teRank);
  }
}

export default EnergyTracker;
