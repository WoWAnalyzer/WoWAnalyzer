import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

class ShatteredFragmentsOfSindragosa extends Analyzer {
  static dependencies = {
		combatants: Combatants,
	};

  damage = 0;
  cometStormCasts = 0;
  legendaryProcs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasHead(ITEMS.SHATTERED_FRAGMENTS_OF_SINDRAGOSA.id);
  }

  on_byPlayer_cast(event) {
    const hasCometStormTalent = this.combatants.selected.hasTalent(SPELLS.COMET_STORM_TALENT.id);
    if (event.ability.guid !== SPELLS.COMET_STORM_TALENT.id || !hasCometStormTalent) {
      return;
    }
    this.cometStormCasts += 1;
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.RAGE_OF_THE_FROST_WYRM.id) {
      return;
    }
    this.legendaryProcs += 1;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.COMET_STORM_DAMAGE.id) {
      return;
    }
      this.damage += event.amount + (event.absorbed || 0);
  }

  item() {
    const legendaryDamage = (this.damage / (this.cometStormCasts + this.legendaryProcs)) * this.legendaryProcs;
    return {
      item: ITEMS.SHATTERED_FRAGMENTS_OF_SINDRAGOSA,
      result: <ItemDamageDone amount={legendaryDamage} />,
    };
  }
}

export default ShatteredFragmentsOfSindragosa;
