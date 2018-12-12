import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Enemies from 'parser/shared/modules/Enemies';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const SIEGEBREAKER_DAMAGE_MODIFIER = 0.15;

class Siegebreaker extends Analyzer {
  damage = 0;
  static dependencies = {
      enemies: Enemies,
  }
  constructor(...args) {
      super(...args);
      this.active = this.selectedCombatant.hasTalent(SPELLS.SIEGEBREAKER_TALENT.id);

      if (!this.active) {
        return;
      }
  
      this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
  }

  onPlayerDamage(event) {
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.SIEGEBREAKER_DEBUFF.id)) {
      this.damage += calculateEffectiveDamage(event, SIEGEBREAKER_DAMAGE_MODIFIER);
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get dpsValue() {
    return this.damage / (this.owner.fightDuration / 1000);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SIEGEBREAKER_TALENT.id}
        label="Siegebreaker"
        value={`${formatThousands(this.dpsValue)} DPS`}
        tooltip={`<b>${formatThousands(this.damage)} (${formatPercentage(this.damagePercent)}%)</b> of your damage can be attributed to Siegebreaker's damage bonus.`}
      />
    );
  }
}
 export default Siegebreaker;