import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';

// Static Charge can only reduce the cooldown down to 40 seconds
const minimumCooldown = 40000;
const stunReduction = 5000;

class StaticCharge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.STATIC_CHARGE_TALENT.id);
  }

  on_byPlayerPet_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.STATIC_CHARGE_DEBUFF.id) {
      return;
    }

    const cooldownRemaining = this.spellUsable.cooldownRemaining(SPELLS.LIGHTNING_SURGE_TOTEM.id);
    if (cooldownRemaining <= minimumCooldown) {
      return;
    }

    this.spellUsable.reduceCooldown(SPELLS.LIGHTNING_SURGE_TOTEM.id, stunReduction);
  }
}

export default StaticCharge;
