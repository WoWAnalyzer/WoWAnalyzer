import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const COMBUST_REDUCTION_MS = 9000;

class PyrotexIgnitionCloth extends Analyzer {

  static dependencies = {
		combatants: Combatants,
    spellUsable: SpellUsable
	};

  cooldownReduction = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasHands(ITEMS.PYROTEX_IGNITION_CLOTH.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PHOENIXS_FLAMES.id) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.COMBUSTION.id)) {
      this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.COMBUSTION.id,(COMBUST_REDUCTION_MS));
    }
  }

  item() {
    const reduction = this.cooldownReduction / 1000;
    return {
      item: ITEMS.PYROTEX_IGNITION_CLOTH,
      result: `Combustion Cooldown Reduced by ${formatNumber(reduction)} seconds`,
    };
  }
}

export default PyrotexIgnitionCloth;
