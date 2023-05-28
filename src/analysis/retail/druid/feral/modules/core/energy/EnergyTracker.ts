import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';

const BASE_MAX_ENERGY = 100;
const TE_ENERGY_PER_RANK = 30;
const BASE_REGEN = 11;
const TE_REGEN_MULT_PER_RANK = 0.075;

class EnergyTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.ENERGY;

    this.initBuilderAbility(SPELLS.TIGERS_FURY.id);

    const teRank = this.selectedCombatant.getTalentRank(TALENTS_DRUID.TIRELESS_ENERGY_TALENT);
    this.maxResource = BASE_MAX_ENERGY + TE_ENERGY_PER_RANK * teRank;
    this.baseRegenRate = BASE_REGEN * (1 + TE_REGEN_MULT_PER_RANK * teRank);

    this.refundOnMiss = true;
    this.refundBlacklist = [
      TALENTS_DRUID.PRIMAL_WRATH_TALENT.id,
      SPELLS.SWIPE_CAT.id,
      SPELLS.THRASH_FERAL.id,
    ];
  }
}

export default EnergyTracker;
