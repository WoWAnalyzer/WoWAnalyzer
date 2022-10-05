import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { TALENTS_DRUID } from 'common/TALENTS';

const WARRIOR_OF_ELUNE_MULTIPLIER = 0.4;

class AstralPowerTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.ASTRAL_POWER;
  }

  // Split Warrior of Elune Astral Power bonus into it's own entry.
  onEnergize(event: ResourceChangeEvent) {
    const spellId = event.ability.guid;
    if (
      spellId !== SPELLS.STARFIRE.id ||
      !this.selectedCombatant.hasBuff(TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT.id)
    ) {
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
    this._applyBuilder(spellId, baseGain, baseWaste, event.timestamp, this.getResource(event));
    this._applyBuilder(
      TALENTS_DRUID.WARRIOR_OF_ELUNE_TALENT.id,
      eluneGain,
      eluneWaste,
      event.timestamp,
      this.getResource(event),
    );
  }

  getReducedCost(event: CastEvent) {
    const resource = this.getResource(event);
    if (!resource || !resource.cost) {
      return 0;
    }
    const cost = resource.cost / 10;
    return cost;
  }
}

export default AstralPowerTracker;
