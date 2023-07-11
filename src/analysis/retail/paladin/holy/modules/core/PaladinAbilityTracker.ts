import SPELLS from 'common/SPELLS';
import { Ability, AbsorbedEvent, EventType, HealEvent } from 'parser/core/Events';
import AbilityTracker, { TrackedAbility } from 'parser/shared/modules/AbilityTracker';

import BeaconTargets from '../beacons/BeaconTargets';

const INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER = 150; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.
const INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME = 200; // if someone heals with FoL and then immediately casts a HS race conditions may occur. This prevents that (although the buff is probably not applied before the FoL).

export interface TrackedPaladinAbility extends TrackedAbility {
  healingIolHits?: number;
  healingIolHealing?: number;
  healingIolAbsorbed?: number;
  healingIolOverheal?: number;
  healingBeaconHits?: number;
  healingBeaconHealing?: number;
  healingBeaconAbsorbed?: number;
  healingBeaconOverheal?: number;
}

class PaladinAbilityTracker extends AbilityTracker {
  static dependencies = {
    ...AbilityTracker.dependencies,
    beaconTargets: BeaconTargets,
  };
  protected beaconTargets!: BeaconTargets;

  getAbility(spellId: number, abilityInfo: Ability | null = null): TrackedPaladinAbility {
    return super.getAbility(spellId, abilityInfo);
  }

  onHeal(event: HealEvent | AbsorbedEvent) {
    super.onHeal(event);

    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    if (spellId === SPELLS.FLASH_OF_LIGHT.id || spellId === SPELLS.HOLY_LIGHT.id) {
      const hasIol = this.selectedCombatant.hasBuff(
        SPELLS.INFUSION_OF_LIGHT.id,
        event.timestamp,
        INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER,
        INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME,
      );

      if (hasIol) {
        cast.healingIolHits = (cast.healingIolHits || 0) + 1;
        cast.healingIolHealing = (cast.healingIolHealing || 0) + (event.amount || 0);
        if (event.type === EventType.Heal) {
          cast.healingIolOverheal = (cast.healingIolOverheal || 0) + (event.overheal || 0);
          cast.healingIolAbsorbed = (cast.healingIolAbsorbed || 0) + (event.absorbed || 0);
        }
      }
    }

    const hasBeacon = this.beaconTargets.hasBeacon(event.targetID);
    if (hasBeacon) {
      cast.healingBeaconHits = (cast.healingBeaconHits || 0) + 1;
      cast.healingBeaconHealing = (cast.healingBeaconHealing || 0) + (event.amount || 0);
      if (event.type === EventType.Heal) {
        cast.healingBeaconAbsorbed = (cast.healingBeaconAbsorbed || 0) + (event.absorbed || 0);
        cast.healingBeaconOverheal = (cast.healingBeaconOverheal || 0) + (event.overheal || 0);
      }
    }
  }
}

export default PaladinAbilityTracker;
