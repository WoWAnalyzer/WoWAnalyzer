import AbilityTracker from 'Main/Parser/Modules/Core/AbilityTracker';
import { FLASH_OF_LIGHT_SPELL_ID, HOLY_LIGHT_SPELL_ID } from 'Main/Parser/Constants';

const INFUSION_OF_LIGHT_SPELL_ID = 54149;
const INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER = 50; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.

class PaladinAbilityTracker extends AbilityTracker {
  on_byPlayer_heal(event) {
    if (super.on_byPlayer_heal) {
      super.on_byPlayer_heal(event);
    }
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    if (spellId === FLASH_OF_LIGHT_SPELL_ID || spellId === HOLY_LIGHT_SPELL_ID) {
      const hasIol = this.owner.selectedCombatant.hasBuff(INFUSION_OF_LIGHT_SPELL_ID, event.timestamp, INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER);

      if (hasIol) {
        cast.iolHits = (cast.iolHits || 0) + 1;
        cast.iolHealing = (cast.iolHealing || 0) + (cast.amount || 0);
        cast.iolAbsorbed = (cast.iolAbsorbed || 0) + (cast.absorbed || 0);
        cast.iolOverheal = (cast.iolOverheal || 0) + (cast.overheal || 0);
      }
    }

    const hasBeacon = this.owner.modules.beaconTargets.hasBeacon(event.targetID);
    if (hasBeacon) {
      cast.beaconHits = (cast.beaconHits || 0) + 1;
      cast.beaconHealing = (cast.beaconHealing || 0) + (cast.amount || 0);
      cast.beaconAbsorbed = (cast.beaconAbsorbed || 0) + (cast.absorbed || 0);
      cast.beaconOverheal = (cast.beaconOverheal || 0) + (cast.overheal || 0);
    }
  }
}

export default PaladinAbilityTracker;
