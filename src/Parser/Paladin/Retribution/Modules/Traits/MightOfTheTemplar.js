import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import getDamageBonusStacked from 'Parser/Paladin/Shared/Modules/getDamageBonusStacked';

const MIGHT_OF_THE_TEMPLAR_INCREASE = 0.02;

/**
 * Might of the Templar (Artifact Trait)
 * Increase the damge done by Templar's Verdict by 2%.
 */
class MightOfTheTemplar extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  damage = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.MIGHT_OF_THE_TEMPLAR.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.TEMPLARS_VERDICT_DAMAGE.id) {
      return;
    }

    this.damage += getDamageBonusStacked(event, MIGHT_OF_THE_TEMPLAR_INCREASE, this.rank);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.MIGHT_OF_THE_TEMPLAR.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %
        </div>
      </div>
    );
  }
}

export default MightOfTheTemplar;
