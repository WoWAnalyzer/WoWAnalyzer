import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from '../MageCore/GetDamageBonus';

const DAMAGE_BONUS = .35;

class ZannesuJourney extends Module {

  static dependencies = {
		combatants: Combatants,
	};

  damage = 0;
  stackCount = 0;
  previousStackCount = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.ZANNESU_JOURNEY.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.BLIZZARD.id) {
      return;
    }
    this.previousStackCount = this.stackCount;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.BLIZZARD_DAMAGE.id) {
      return;
    }
      this.damage += getDamageBonus(event, DAMAGE_BONUS * this.previousStackCount);
      console.log('Blizzard Cast');
      console.log(this.previousStackCount);
      console.log(this.damage);
  }

  on_toPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.ZANNESU_JOURNEY_BUFF.id) {
      return;
    }
    this.stackCount += 1;
  }

  on_toPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.ZANNESU_JOURNEY_BUFF.id || this.stackCount === 5) {
      return;
    }
    this.stackCount += 1;
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.ZANNESU_JOURNEY_BUFF.id) {
      return;
    }
    this.stackCount = 0;
  }

  item() {
    return {
      item: ITEMS.ZANNESU_JOURNEY,
      result: `${this.owner.formatItemDamageDone(this.damage)}`,
    };
  }
}

export default ZannesuJourney;
