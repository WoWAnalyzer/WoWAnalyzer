import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import SpellLink from 'common/SpellLink';

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
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.LASER_MATRIX_HEAL.id) {
      this.healing += event.amount + (event.absorbed || 0);
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LASER_MATRIX_DAMAGE.id) {
      this.damage += event.amount + (event.absorbed || 0);
    }
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
          <React.Fragment>
            {formatPercentage(healingThroughputPercent)} % healing<br />
            {formatPercentage(damageThroughputPercent)} % damage<br />
            Gained <SpellLink id={SPELLS.REORIGINATION_ARRAY.id} /><br />
          </React.Fragment>
        )}
        tooltip={`Healing done: ${formatNumber(this.healing)} <br />
                  Damage done: ${formatNumber(this.damage)} <br />`
        }
      />
    );
  }
}

export default LaserMatrix;
