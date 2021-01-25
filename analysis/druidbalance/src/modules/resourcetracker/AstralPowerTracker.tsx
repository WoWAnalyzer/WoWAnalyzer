import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { CastEvent, EnergizeEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';

const WARRIOR_OF_ELUNE_MULTIPLIER = 0.4;
const SOUL_OF_THE_FOREST_REDUCTION = 10;

class AstralPowerTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.ASTRAL_POWER;
  }

  // Split Warrior of Elune Astral Power bonus into it's own entry.
  onEnergize(event: EnergizeEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LUNAR_STRIKE.id || !this.selectedCombatant.hasBuff(SPELLS.WARRIOR_OF_ELUNE_TALENT.id)) {
      super.onEnergize(event);
      return;
    }
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const gain = event.resourceChange;
    const eluneRaw = gain - gain / (1 + WARRIOR_OF_ELUNE_MULTIPLIER);
    const eluneWaste = Math.min(event.waste, eluneRaw);
    const baseWaste = event.waste - eluneWaste;
    const baseGain = gain - eluneRaw - baseWaste;
    const eluneGain = eluneRaw - eluneWaste;
    this._applyBuilder(spellId, baseGain, baseWaste, this.getResource(event));
    this._applyBuilder(SPELLS.WARRIOR_OF_ELUNE_TALENT.id, eluneGain, eluneWaste, this.getResource(event));
  }

  getReducedCost(event: CastEvent) {
    const resource = this.getResource(event);
    if (!resource || !resource.cost) {
      return 0;
    }
    let cost = resource.cost / 10;
    const abilityId = event.ability.guid;
    if (abilityId === SPELLS.STARFALL_CAST.id && this.selectedCombatant.hasTalent(SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE.id)) {
      cost = cost - SOUL_OF_THE_FOREST_REDUCTION;
    }
    return cost;
  }
}

export default AstralPowerTracker;
