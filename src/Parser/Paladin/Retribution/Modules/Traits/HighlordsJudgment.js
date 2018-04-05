import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import getDamageBonusStacked from 'Parser/Paladin/Shared/Modules/getDamageBonusStacked';

const HIGHLORDS_JUDGMENT_INCREASE = 0.08;

/**
 * Highlord's Judgment (Artifact Trait)
 * Increase the damge done by Judgment by 8%.
 */

class HighlordsJudgment extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  damage = 0;

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.HIGHLORDS_JUDGMENT.id];
    this.active = this.rank > 0;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.JUDGMENT_CAST.id) {
      return;
    }
    this.damage += getDamageBonusStacked(event, HIGHLORDS_JUDGMENT_INCREASE, this.rank);
  }

  subStatistic() {
    return (
      <div className='flex'>
        <div className='flex-main'>
          <SpellLink id={SPELLS.HIGHLORDS_JUDGMENT.id} />
        </div>
        <div className='flex-sub text-right'>
          {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %
        </div>
      </div>
    );
  }
}

export default HighlordsJudgment;
