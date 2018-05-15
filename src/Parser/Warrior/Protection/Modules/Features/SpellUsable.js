import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
  };

  on_initialized() {
    this.hasDevastator = this.combatants.selected.hasTalent(SPELLS.DEVASTATOR_TALENT.id);  
  }

  lastPotentialTriggerForShieldSlam = null;
  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }

    const spellId = event.ability.guid;
    if ((spellId === SPELLS.MELEE.id && this.hasDevastator) || spellId === SPELLS.THUNDER_CLAP.id || spellId === SPELLS.REVENGE.id) {
      this.lastPotentialTriggerForShieldSlam = event;
    } else if (spellId === SPELLS.SHIELD_SLAM.id) {
      this.lastPotentialTriggerForShieldSlam = null;
    }
  }

  beginCooldown(spellId, timestamp) {
    if (spellId === SPELLS.SHIELD_SLAM.id) {
      if (this.isOnCooldown(spellId)) {
        this.endCooldown(spellId, undefined, this.lastPotentialTriggerForShieldSlam ? this.lastPotentialTriggerForShieldSlam.timestamp : undefined);
      }
    }

    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
