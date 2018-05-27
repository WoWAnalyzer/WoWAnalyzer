import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';
import GlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
    globalCooldown: GlobalCooldown,
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
    if (spellId === SPELLS.MELEE.id && this.hasDevastator) {
      this.lastPotentialTriggerForShieldSlam = event;
    } else if (spellId === SPELLS.DEVASTATE.id || spellId === SPELLS.THUNDER_CLAP.id || spellId === SPELLS.REVENGE.id) {
      this.lastPotentialTriggerForShieldSlam = { ...event };
      //reset the cooldown to after the GCD of the resetting ability
      this.lastPotentialTriggerForShieldSlam.timestamp += this.globalCooldown.getCurrentGlobalCooldown(spellId);
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
