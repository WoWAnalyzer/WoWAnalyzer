import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';

const DAMAGE_BONUS = .35;

class ZannesuJourney extends Module {

  static dependencies = {
		combatants: Combatants,
	};

  damage = 0;
  stackCount = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.ZANNESU_JOURNEY.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.BLIZZARD.id) {
      return;
    }
    const buff = this.combatants.selected.getBuff(SPELLS.ZANNESU_JOURNEY_BUFF.id);
    this.stackCount = (buff && buff.stacks) || 0;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.BLIZZARD_DAMAGE.id) {
      return;
    }
      this.damage += getDamageBonus(event, DAMAGE_BONUS * this.stackCount);
  }

  item() {
    return {
      item: ITEMS.ZANNESU_JOURNEY,
      result: this.owner.formatItemDamageDone(this.damage),
    };
  }
}

export default ZannesuJourney;
