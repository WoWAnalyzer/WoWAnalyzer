import React from 'react';
import SPELLS from 'common/SPELLS';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';

/* Reverse Harm is a PvP talent granted by the Conflict and Strife major essence
*/

class ReverseHarm extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasEssence(SPELLS.CONFLICT.traitId) ? this.selectedCombatant.hasMajor(SPELLS.CONFLICT.traitId) : false;
  }

  get damageDone() {
    const spell = this.abilityTracker.getAbility(SPELLS.REVERSE_HARM_DAMAGE.id);
    return spell.damageEffective + spell.damageAbsorbed;
  }

  get dps() {
    return this.damageDone / this.owner.fightDuration * 1000;
  }

  get healingDone() {
    const spell = this.abilityTracker.getAbility(SPELLS.REVERSE_HARM.id);
    return spell.healingEffective + spell.healingAbsorbed;
  }

  get hps() {
    return this.healingDone / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        tooltip={(
          <>Total Damage: {formatNumber(this.damageDone)}<br />
            Total Healing: {formatNumber(this.healingDone)}
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.REVERSE_HARM}>
          <img
            src="/img/sword.png"
            alt="Damage"
            className="icon"
          />{' '}
          {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damageDone))} % of total</small>
          <img
            src="/img/healing.png"
            alt="Healing"
            className="icon"
          />{' '}
          {formatNumber(this.hps)} HPS <small>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healingDone))} % of total</small>
          </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ReverseHarm;
