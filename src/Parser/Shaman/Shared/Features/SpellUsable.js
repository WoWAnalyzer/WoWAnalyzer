import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';

// Static Charge can only reduce the cooldown down to 40 seconds
const minimumCooldown = 40000;

class SpellUsable extends CoreSpellUsable {
  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
  };

  on_initialized() {
    this.hasStaticCharge = this.combatants.selected.hasTalent(SPELLS.STATIC_CHARGE_TALENT.id);
  }

  on_byPlayerPet_applydebuff(event) {
    const spellId = event.ability.guid;
    if (!this.hasStaticCharge || spellId !== SPELLS.STATIC_CHARGE_DEBUFF.id) {
      return;
    }

    const cooldownRemaining = this.cooldownRemaining(SPELLS.LIGHTNING_SURGE_TOTEM_TALENT.id);
    if (cooldownRemaining <= minimumCooldown) {
      return;
    }

    const stunReduction = 5000;
    this.reduceCooldown(SPELLS.LIGHTNING_SURGE_TOTEM_TALENT.id, stunReduction);
  }
}

export default SpellUsable;
