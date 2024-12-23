import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

const debug = false;
const MAX_ARCANE_CHARGES = 4;

class ArcaneChargeTracker extends ResourceTracker {
  static dependencies = {
    ...ResourceTracker.dependencies,
  };

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.ARCANE_CHARGES;
    this.maxResource = MAX_ARCANE_CHARGES;
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onResourceChange);
  }

  onResourceChange(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.ARCANE_CHARGES.id) {
      return;
    }

    if (this.current !== MAX_ARCANE_CHARGES) {
      this._applyBuilder(event.ability.guid, event.resourceChange, event.waste, event.timestamp);
      debug && this.log('Build: ' + this.current);
    }
  }

  clearCharges(event: CastEvent) {
    debug && this.log('Spend: ' + this.current);
    this._applySpender(event, this.current);

    if (this.selectedCombatant.hasBuff(SPELLS.INTUITION_BUFF.id)) {
      debug && this.log('Intuition Buff');
      this._applyBuilder(event.ability.guid, MAX_ARCANE_CHARGES, 0, event.timestamp);
    }

    if (this.selectedCombatant.hasBuff(SPELLS.GLORIOUS_INCANDESCENCE_BUFF.id)) {
      debug && this.log('Glorious Incandescence Buff');
      this._applyBuilder(event.ability.guid, MAX_ARCANE_CHARGES, 0, event.timestamp);
    }

    if (this.selectedCombatant.hasBuff(SPELLS.BURDEN_OF_POWER_BUFF.id)) {
      debug && this.log('Burden of Power Buff');
      this._applyBuilder(event.ability.guid, MAX_ARCANE_CHARGES, 0, event.timestamp);
    }

    if (this.selectedCombatant.hasBuff(SPELLS.ARCANE_SOUL_BUFF.id)) {
      debug && this.log('Arcane Soul Buff');
      this._applyBuilder(event.ability.guid, MAX_ARCANE_CHARGES, 0, event.timestamp);
    }
  }
}

export default ArcaneChargeTracker;
