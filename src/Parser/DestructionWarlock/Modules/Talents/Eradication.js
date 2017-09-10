import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import getDamageBonus from '../WarlockCore/getDamageBonus';

const ERADICATION_DAMAGE_BONUS = 0.15;

//only calculates the bonus damage, output depends if we have the talent directly or via legendary finger (then it appears as either a Statistic or Item)
class Eradication extends Module {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ERADICATION_TALENT.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_NETHERLORD.id);
  }

  on_byPlayer_damage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || enemy.hasBuff(SPELLS.ERADICATION_DEBUFF.id, event.timestamp)) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, ERADICATION_DAMAGE_BONUS);
  }
}

export default Eradication;
