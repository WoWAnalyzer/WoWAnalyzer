import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

class ContainedInfernalCore extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;
  meteorCasts = 0;
  legendaryProcs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.CONTAINED_INFERNAL_CORE.id);
  }

  on_byPlayer_cast(event) {
    const hasMeteorTalent = this.combatants.selected.hasTalent(SPELLS.METEOR_TALENT.id);
    if (event.ability.guid !== SPELLS.METEOR_TALENT.id || !hasMeteorTalent) {
      return;
    }
    this.meteorCasts += 1;
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.ERUPTING_INFERNAL_CORE.id) {
      return;
    }
    this.legendaryProcs += 1;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.METEOR_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  item() {
    const legendaryDamage = (this.damage / (this.meteorCasts + this.legendaryProcs)) * this.legendaryProcs;
    return {
      item: ITEMS.CONTAINED_INFERNAL_CORE,
      result: <ItemDamageDone amount={legendaryDamage} />,
    };
  }
}

export default ContainedInfernalCore;
