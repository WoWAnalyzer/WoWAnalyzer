import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';

const DAMAGE_BONUS = .03;

class MagtheridonsBanishedBracers extends Analyzer {

  static dependencies = {
		combatants: Combatants,
	};

  damage = 0;
  stackCount = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.MAGTHERIDONS_BANISHED_BRACERS.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.ICE_LANCE_DAMAGE.id) {
      return;
    }
      const buff = this.combatants.selected.getBuff(SPELLS.MAGTHERIDONS_MIGHT_BUFF.id);
      if (buff) {
        this.damage += getDamageBonus(event, DAMAGE_BONUS * buff.stacks);
      }
  }

  item() {
    return {
      item: ITEMS.MAGTHERIDONS_BANISHED_BRACERS,
      result: this.owner.formatItemDamageDone(this.damage),
    };
  }
}

export default MagtheridonsBanishedBracers;
