import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';
import DamageTracker from 'Parser/Core/Modules/AbilityTracker';

class InsigniaOfRavenholdt extends Analyzer {
  static dependencies = {
		combatants: Combatants,
		damageTracker: DamageTracker,
  };

	on_initialized(){
		this.active = this.combatants.selected.hasFinger(ITEMS.INSIGNIA_OF_RAVENHOLDT.id);
  }
  

  item() {
    const damage = this.damageTracker.getAbility(SPELLS.INSIGNIA_OF_RAVENHOLDT.id).damageEffective;

    return {
      item: ITEMS.INSIGNIA_OF_RAVENHOLDT,
      result: this.owner.formatItemDamageDone(damage),
    };
  }
}

export default InsigniaOfRavenholdt;