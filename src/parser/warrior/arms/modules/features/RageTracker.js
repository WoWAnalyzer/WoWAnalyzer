import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';

const RAGE_PER_MELEE_HIT = 25;

class RageUsage extends ResourceTracker {
  lastMeleeTaken = 0;

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.RAGE;
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this.onDamage);
  }

  getReducedCost(event) {
    if (!this.getResource(event).cost) {
      return 0;
    }
    const cost = this.getResource(event).cost / 10;
    return cost;
  }

  onDamage(event) {
    this.processInvisibleEnergize(SPELLS.RAGE_AUTO_ATTACKS.id, RAGE_PER_MELEE_HIT);
  }
}

export default RageUsage;
