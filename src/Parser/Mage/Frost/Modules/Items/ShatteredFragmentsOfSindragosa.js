import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Shattered Fragments of Sindragosa:
 * Casting 15 Frostbolts or Flurries calls down a Comet Storm at your target.
 */
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
    const spellId = event.ability.guid;
    const hasCometStormTalent = this.combatants.selected.hasTalent(SPELLS.COMET_STORM_TALENT.id);
    if (spellId !== SPELLS.COMET_STORM_TALENT.id || !hasCometStormTalent) {
      return;
    }
    this.cometStormCasts += 1;
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RAGE_OF_THE_FROST_WYRM.id) {
      return;
    }
    this.legendaryProcs += 1;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COMET_STORM_DAMAGE.id) {
      return;
    }
      this.damage += event.amount + (event.absorbed || 0);
  }

  get legendaryDamage() {
    return (this.damage / (this.comerStormCasts + this.legendaryProcs)) * this.legendaryProcs;
  }

  item() {
    return {
      item: ITEMS.SHATTERED_FRAGMENTS_OF_SINDRAGOSA,
      result: <ItemDamageDone amount={this.legendaryDamage} />,
    };
  }
}

export default ShatteredFragmentsOfSindragosa;
