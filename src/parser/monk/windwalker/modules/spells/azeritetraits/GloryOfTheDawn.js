import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import ChiTracker from 'parser/monk/windwalker/modules/resources/ChiTracker';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';

/**
 * Rising Sun Kick has a 25% chance to trigger a second time, dealing 4950 Physical damage and restoring 1 Chi.
 */
class GloryOfTheDawn extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    chiTracker: ChiTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GLORY_OF_THE_DAWN.id);
  }
  
  get damageDone() {
    const spell = this.abilityTracker.getAbility(SPELLS.GLORY_OF_THE_DAWN_HIT.id);
    return spell.damageEffective + spell.damageAbsorbed;
  }

  get chiGain() {
    return this.chiTracker.getGeneratedBySpell(SPELLS.GLORY_OF_THE_DAWN_HIT.id);
  }

  get dps(){
    return this.damageDone / this.owner.fightDuration * 1000;
  }
  
  statistic() {
    return (
      <AzeritePowerStatistic
        size="medium"
        tooltip={<>Damage done: {formatNumber(this.damageDone)}</>}
      >
        <BoringSpellValueText spell={SPELLS.GLORY_OF_THE_DAWN}>
        <img
          src="/img/sword.png"
          alt="Damage"
          className="icon"
        /> {formatNumber(this.dps)} <small>DPS / {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageDone))} % of total</small> 
          <br />
          {this.chiGain} <small>Chi Gained</small>
        </BoringSpellValueText>
      </AzeritePowerStatistic>
    );
 	}
}

export default GloryOfTheDawn;