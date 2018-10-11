import React from 'react';
import LaserMatrix from 'parser/shared/modules/spells/bfa/azeritetraits/LaserMatrix';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { findItemLevelByPrimaryStat, getPrimaryStatForItemLevel } from 'parser/druid/restoration/modules/items/azeritetraits/common';
import StatWeights from 'parser/druid/restoration/modules/features/StatWeights';

/**
 * Your spells and abilities have a chance to release a barrage of lasers, dealing 4058 Arcane damage
 * split among all enemies and restoring 5073 health split among injured allies.
 */
class LaserMatrixRestoDruid extends LaserMatrix{
  static dependencies = {
    statWeights: StatWeights,
  };

  avgItemLevel = 0;
  traitLevel = 0;

  constructor(...args){
    super(...args);
    if(this.active) {
      this.avgItemLevel = this.selectedCombatant.traitsBySpellId[SPELLS.LASER_MATRIX.id]
        .reduce((a, b) => a + b) / this.selectedCombatant.traitsBySpellId[SPELLS.LASER_MATRIX.id].length;
      this.traitLevel = this.selectedCombatant.traitsBySpellId[SPELLS.LASER_MATRIX.id].length;
    }
  }

  statistic(){
    const healingThroughputPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(this.damage);
    const onePercentThroughputInInt = this.statWeights._ratingPerOnePercent(this.statWeights.totalOneInt);
    const intGain = onePercentThroughputInInt * healingThroughputPercent * 100;
    const ilvlGain = findItemLevelByPrimaryStat(getPrimaryStatForItemLevel(this.avgItemLevel) + intGain) - this.avgItemLevel;

    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LASER_MATRIX.id}
        value={(
          <>
            {formatPercentage(healingThroughputPercent)} % healing<br />
            {formatPercentage(damageThroughputPercent)} % damage<br />
            Gained <SpellLink id={SPELLS.REORIGINATION_ARRAY.id} /><br />
          </>
        )}
        tooltip={`Healing done: ${formatNumber(this.healing)} <br />
                  Damage done: ${formatNumber(this.damage)} <br />
                  Laser Matrix gave you equivalent to <b>${formatNumber(intGain)}</b> (${formatNumber(intGain/this.traitLevel)}
            per level) int. This is worth roughly <b>${formatNumber(ilvlGain)}</b> (${formatNumber(ilvlGain/this.traitLevel)}
            per level) item levels (only counting healing).`
        }
      />
    );
  }
}

export default LaserMatrixRestoDruid;
