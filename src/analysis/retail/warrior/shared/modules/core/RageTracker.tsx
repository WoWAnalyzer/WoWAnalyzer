import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { formatDuration } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import Events, {
  AnyEvent,
  CastEvent,
  EventType,
  ResourceActor,
  ResourceChangeEvent,
} from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { RAGE_SCALE_FACTOR } from '../normalizers/rageNormalizers/constants';

class RageTracker extends ResourceTracker {
  maxResource = 100;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RAGE;

    // Add 15 rage for each rank of Overwhelming Rage, adjust for scale factor
    this.maxResource += this.selectedCombatant.getTalentRank(TALENTS.OVERWHELMING_RAGE_TALENT) * 15;

    // Kepe track of rage
    let expectedRage: number | undefined = undefined;
    this.addEventListener(Events.any, (event: AnyEvent) => {
      if (event.type === EventType.SpendResource) {
        // This is a fabricated event from the base ResourceTracker, which is not useful for us
        return;
      }

      const rage = _getRage(event, this.selectedCombatant);

      let warning = false;
      const parts: string[] = [];
      if ('resourceChange' in event) {
        parts.push(`Resource Change: ${event.resourceChange}`);
        if ('waste' in event && event.waste !== 0) {
          parts.push(`Waste: ${event.waste}`);
        }
        if (expectedRage != null) {
          expectedRage += event.resourceChange - (event as any).waste || 0;
        }
      }

      if (
        expectedRage != null &&
        rage != null &&
        rage.amount != null &&
        rage.amount !== expectedRage
      ) {
        parts.push(`Rage mismatch! Expected: ${expectedRage}`);
        warning = true;
      }

      if (rage != null && rage.amount != null) {
        parts.push(`Current Rage: ${rage.amount}`);
        expectedRage = rage.amount;
      }

      if (rage != null && rage.cost != null) {
        parts.push(`Cost: ${rage.cost}`);
        if (expectedRage != null && rage.cost > 0) {
          expectedRage -= rage.cost;
        }
      }

      (warning ? console.warn : console.log)(
        [
          `[rageTracker] ${formatDuration(event.timestamp - this.fightData.startTimestamp, 3)}: ${event.type}(${(event as any)?.ability?.name} ${(event as any)?.ability?.guid})`,
          ...parts,
        ].join(', '),
      );
    });
  }

  getAdjustedGain(event: ResourceChangeEvent): { gain: number; waste: number } {
    const baseGain = super.getAdjustedGain(event);
    return { gain: baseGain.gain * RAGE_SCALE_FACTOR, waste: baseGain.waste * RAGE_SCALE_FACTOR };
  }

  getAdjustedCost(event: CastEvent): number | undefined {
    const baseCost = super.getAdjustedCost(event);
    return baseCost ? baseCost * RAGE_SCALE_FACTOR : undefined;
  }
}

export default RageTracker;

function _getRage(event: AnyEvent, selectedCombatant: Combatant) {
  if ('classResources' in event && 'resourceActor' in event) {
    if (
      event.resourceActor === ResourceActor.Source &&
      'sourceID' in event &&
      event.sourceID === selectedCombatant.id &&
      // Charge cast when target is reached has classResources from when it was triggerd
      // We could maybe do a normalizer step before which adjusts this, but I think it's unecessary
      event.ability?.guid !== SPELLS.CHARGE_2.id
    ) {
      return event.classResources?.find((resource) => resource.type === RESOURCE_TYPES.RAGE.id);
    } else if (
      event.resourceActor === ResourceActor.Target &&
      event.targetID === selectedCombatant.id &&
      // It seems like heals show the amounts when cast, not when applied, so will often be incorrect
      event.type !== EventType.Heal
    ) {
      return event.classResources?.find((resource) => resource.type === RESOURCE_TYPES.RAGE.id);
    }
  }
}
