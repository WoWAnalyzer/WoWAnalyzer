import React from 'react';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import MainDamageTaken, { DamageValue }from 'Parser/Core/Modules/DamageTaken';
import { getMagicDescription } from 'common/DamageTypes.js';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';

const debug = true;

class DamageTaken extends MainDamageTaken {
  
  on_toPlayer_absorbed(event) {
    // Need to take the stagger absorb off damage taken, other absorbs such as external and Dark Side of the Moon should remain.
    // Stagger is special because the absorb is not damage taken its just deferred to the dot which is already counted.
    if (event.ability.guid === SPELLS.STAGGER.id) {
      // We are excluding the shaman totem redistribution from damage taken because the logs do, also removing the absorb of that redistribution
      // However the damage added to the stagger dot is true damage taken so is counted in logs.
      if (event.extraAbility.guid === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id) {
        this.shamanTotem.reduceDamage(event);
        return;
      }
      // event.extraAbility is the ability which was reduced by stagger
      const type = getMagicDescription(event.extraAbility.type);
      if (this.damageBySchool[type] === undefined) {
        this.damageBySchool[type] = new DamageValue();
      }
      if (this.damageByAbility[event.extraAbility.name] === undefined) {
        this.damageByAbility[event.extraAbility.name] = new DamageValue();
      }
      // Need to reduce absorbed in the original array rather than amount...
      this.damageBySchool[type].reduceDamage({absorbed: event.amount});
      this.damageByAbility[event.extraAbility.name].reduceDamage({absorbed: event.amount});
      this.totalDamage.reduceDamage({absorbed: event.amount});
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="class_monk" alt="Damage taken" />}
        value={`${formatNumber(this.totalDamage.total / this.owner.fightDuration * 1000)} DTPS`}
        label='Damage taken'
        tooltip={`Damage taken breakdown:
            <ul>
              ${Object.keys(this.damageBySchool).reduce((v, type) => {
                return v+=`<li>${type} damage taken ${formatThousands(this.damageBySchool[type].total)} (${formatPercentage(this.damageBySchool[type].total/this.totalDamage.total)}%)</li>`; 
              }, '')}
            </ul>
            Total damage taken ${formatThousands(this.totalDamage.total)} (${formatThousands(this.totalDamage.overkill)} overkill)`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);

  on_finished() {
    debug && console.log(this);
  }
}

export default DamageTaken;
