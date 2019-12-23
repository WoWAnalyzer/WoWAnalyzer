import React from 'react';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import StatisticBox from 'interface/others/StatisticBox';
import SpellLink from 'parser/shaman/elemental/modules/talents/Icefury';

class LightningShield extends Analyzer {

  damageGained=0;
  overchargeCount=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LIGHTNING_SHIELD_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid!==SPELLS.LIGHTNING_SHIELD_TALENT.id) {
      return;
    }
    this.damageGained += event.amount;
  }

  on_byPlayer_energize(event) {
    if (event.ability.guid!==SPELLS.LIGHTNING_SHIELD_OVERCHARGE.id) {
      return;
    }
    this.maelstromGained += event.amount;
  }

  on_byPlayer_buffapply(event) {
    if (event.ability.guid!==SPELLS.LIGHTNING_SHIELD_OVERCHARGE.id) {
      return;
    }
    this.overchargeCount += 1;

  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  get suggestionThresholds() {
    return {
      actual: this.selectedCombatant.getBuffUptime(SPELLS.LIGHTNING_SHIELD_TALENT.id),
      isLessThan: {
        major: 1,
      },
      style: 'decimal',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual) => {
      return suggest(<>You should fully utilize your <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> by using it before combat.</>)
        .icon(SPELLS.LIGHTNING_SHIELD_TALENT.icon)
        .actual(<>You kept up <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> for ${formatPercentage(actual)}% of the fight.</>)
        .recommended(<>It is possible to keep up <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> for 100% of the fight by casting it pre-combat.</>);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LIGHTNING_SHIELD_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
}

export default LightningShield;
