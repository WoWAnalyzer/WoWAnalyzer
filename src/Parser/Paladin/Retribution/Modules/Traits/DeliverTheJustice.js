import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import getDamageBonusStacked from 'Parser/Paladin/Shared/Modules/getDamageBonusStacked';

const DELIVER_THE_JUSTICE_INCREASE = 0.08;

/**
 * Deliver The Justice (Artifact Trait)
 * Increase the damge done by Blade of Justice/Divine Hammers by 8%.
 */
class DeliverTheJustice extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  damage = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.DELIVER_THE_JUSTICE.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.BLADE_OF_JUSTICE.id || event.ability.guid === SPELLS.DIVINE_HAMMER_HIT.id) {
      this.damage += getDamageBonusStacked(event, DELIVER_THE_JUSTICE_INCREASE, this.rank);
    }
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.DELIVER_THE_JUSTICE.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %
        </div>
      </div>
    );
  }
}

export default DeliverTheJustice;
