import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  BeginChannelEvent,
  CastEvent,
  DamageEvent,
  DrainEvent,
  HealEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

const RAGE_PER_MELEE_HIT = 25;

class RageUsage extends ResourceTracker {
  lastMeleeTaken = 0;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RAGE;
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this.onDamage);
  }

  getAdjustedCost(
    event:
      | BeginChannelEvent
      | CastEvent
      | HealEvent
      | DamageEvent
      | ResourceChangeEvent
      | DrainEvent,
  ) {
    const cost = (this.getResource(event)?.cost || 0) / 10;
    return cost;
  }

  onDamage(event: DamageEvent) {
    if (event.hitType === HIT_TYPES.CRIT) {
      this.processInvisibleEnergize(
        SPELLS.RAGE_AUTO_ATTACKS.id,
        RAGE_PER_MELEE_HIT * 1.3,
        event.timestamp,
      );
    } else if (event.hitType === HIT_TYPES.NORMAL) {
      this.processInvisibleEnergize(
        SPELLS.RAGE_AUTO_ATTACKS.id,
        RAGE_PER_MELEE_HIT,
        event.timestamp,
      );
    }
  }
}

export default RageUsage;
