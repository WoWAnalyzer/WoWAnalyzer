import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import SpellLink from 'common/SpellLink';
import Events from 'parser/core/Events';

/**
 * Your spells and abilities have a chance to release a barrage of lasers, dealing 4058 Arcane damage
 * split among all enemies and restoring 5073 health split among injured allies.
 */
class LaserMatrix extends Analyzer{
  healing = 0;
  damage = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.LASER_MATRIX.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LASER_MATRIX_HEAL), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LASER_MATRIX_DAMAGE), this.onDamage);
  }

  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  onDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  // TODO - Show actual gain from Reorigination Array (as an own module perhaps?)
  statistic(){
    const healingThroughputPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const damageThroughputPercent = this.owner.getPercentageOfTotalDamageDone(this.damage);

    return(
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LASER_MATRIX.id}
        value={(
          <>
            {formatPercentage(healingThroughputPercent)} % healing<br />
            {formatPercentage(damageThroughputPercent)} % damage<br />
            Gained <SpellLink id={SPELLS.REORIGINATION_ARRAY.id} />
          </>
        )}
        tooltip={(
          <>
            Healing done: {formatNumber(this.healing)} <br />
            Damage done: {formatNumber(this.damage)}
          </>
        )}
      />
    );
  }
}

export default LaserMatrix;
