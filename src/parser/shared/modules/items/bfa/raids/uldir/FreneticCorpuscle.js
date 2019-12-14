import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemDamageDone from 'interface/ItemDamageDone';
import {formatNumber} from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';

/**
 * Frenetic Corpuscle -
 * Equip: Your attacks have a chance to grant you Frothing Rage for 45 sec. When Frothing Rage
 * reaches 4 charges, your next attack will deal an additional 19496 Physical damage.
 *
 * Test Log: /report/YMNxGdhvkbDHKnWt/3-LFR+Champion+of+the+Light+-+Kill+(2:18)/Horesuz
 */
class FreneticCorpuscle extends Analyzer {
  totalDamage = 0;
  hits = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.FRENETIC_CORPUSCLE.id);
  }

  on_byPlayer_damage(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.FRENETIC_BLOW.id){
      this.totalDamage += (event.amount || 0) + (event.absorbed || 0);
      this.hits += 1;
    }
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={<>Hit <strong>{this.hits}</strong> times for an average of <strong>{formatNumber(this.totalDamage/this.hits)}</strong> damage per hit.</>}
      >
        <BoringItemValueText item={ITEMS.FRENETIC_CORPUSCLE}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default FreneticCorpuscle;
