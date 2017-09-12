import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

class MagistrikeRestraints extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.MAGISTRIKE_RESTRAINTS.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.MAGISTRIKE_RESTRAINTS_CHAOS_BOLT.id) {
      this.bonusDmg += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.MAGISTRIKE_RESTRAINTS,
      result: `${formatNumber(this.bonusDmg)} damage contributed - ${this.owner.formatItemDamageDone(this.bonusDmg)}`,
    };
  }
}

export default MagistrikeRestraints;
