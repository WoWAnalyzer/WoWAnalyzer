import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';

class SpellUsable extends CoreSpellUsable {
  lastPotentialTrigger = null;

  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
  };

  on_initialized() {
    this.has2set = this.combatants.selected.hasBuff(SPELLS.WARLOCK_DEMO_T20_2P_BONUS.id);
  }

  on_byPlayer_cast(event){
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }

    const spellId = event.ability.guid;
    // TODO: verify it still works with new Shadow Bolt ID (or Demonbolt? but that's rather not probable)
    if (this.has2set && spellId === SPELLS.SHADOW_BOLT_DEMO.id) {
        this.lastPotentialTrigger = event.timestamp;
    } else if (spellId === SPELLS.CALL_DREADSTALKERS.id){
      this.lastPotentialTrigger = null;
    }
  }

  beginCooldown(spellId, timestamp) {
    if (spellId === SPELLS.CALL_DREADSTALKERS.id && this.isOnCooldown(spellId)) {
      this.endCooldown(spellId, undefined, this.lastPotentialTrigger ? this.lastPotentialTrigger : undefined);
    }
    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
