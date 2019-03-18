import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import StatTracker from 'parser/shared/modules/StatTracker';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const DRAIN_LIFE_SP_COEFFICIENT = 0.12; // taken from Simcraft SpellDataDump
const debug = false;

class InevitableDemise extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  damagePerStack = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.INEVITABLE_DEMISE.id);
    if (!this.active) {
      return;
    }
    const damageBeforeDR = this.selectedCombatant.traitsBySpellId[SPELLS.INEVITABLE_DEMISE.id].reduce((total, rank) => {
      const [ damage ] = calculateAzeriteEffects(SPELLS.INEVITABLE_DEMISE.id, rank);
      return total + damage;
    }, 0);
    const traitCount = this.selectedCombatant.traitsBySpellId[SPELLS.INEVITABLE_DEMISE.id].length;
    // Inevitable Demise suffers from diminishing returns for multiple traits
    // First trait is worth 100%, all others are 75%
    // 1 trait (100%) = damageBeforeDR * 1
    // 2 traits (87,5%) = damageBeforeDR * (1 + 0.75)/2 = 0.875 * damageBeforeDR
    // 3 traits (83,333%) = damageBeforeDR * (1 + 0.75 + 0.75)/3 = 0.833333 * damageBeforeDR
    this.damagePerStack = damageBeforeDR * ((1 + 0.75 * (traitCount - 1)) / traitCount); // traitCount should never be 0, if player doesn't have it, we return early

    debug && this.log(`Total damage per tick - before DR: ${damageBeforeDR}, trait count: ${traitCount}, after DR: ${this.damagePerStack}`);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DRAIN_LIFE), this.onDrainLifeDamage);
  }

  onDrainLifeDamage(event) {
    const buff = this.selectedCombatant.getBuff(SPELLS.INEVITABLE_DEMISE_BUFF.id);
    const currentStacks = buff ? buff.stacks : 0;
    const totalDamage = event.amount + (event.absorbed || 0);
    const [ bonusDamage ] = calculateBonusAzeriteDamage(event, [currentStacks * this.damagePerStack], DRAIN_LIFE_SP_COEFFICIENT, this.statTracker.currentIntellectRating);
    debug && this.log(`Drain Life damage, current stacks: ${currentStacks}, current bonus base damage: ${currentStacks * this.damagePerStack}, total damage: ${totalDamage}, Drain damage: ${totalDamage - bonusDamage}, bonus damage: ${bonusDamage}`);
    this.damage += bonusDamage;
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="small"
        tooltip={`Bonus Drain Life damage: ${formatThousands(this.damage)}`}
      >
        <BoringSpellValueText spell={SPELLS.INEVITABLE_DEMISE}>
          <span style={{ fontSize: 29 }}>
            {formatNumber(this.damage / this.owner.fightDuration * 1000)} DPS <small>({formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total)</small>
          </span>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
  }
}

export default InevitableDemise;
