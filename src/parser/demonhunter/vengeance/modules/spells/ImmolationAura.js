import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatThousands, formatDuration } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class ImmolationAura extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  get suggestionThresholds() {
    return {
      actual: 100,
      isGreaterThan: {
        minor: 10,
        average: 10,
        major: 10,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<> Be strong edgelord, your destiny is your own. Till the healer goes afk, then Infernal Strike away.</>)
          .icon(SPELLS.METAMORPHOSIS_HAVOC_BUFF.icon)
          .actual(`${formatPercentage(actual)}% edgyness displayed`)
          .recommended(`${formatPercentage(recommended)}% is recommended.`);
      });
  }

  statistic() {
    const immolationAuraUptime = this.selectedCombatant.getBuffUptime(SPELLS.IMMOLATION_AURA.id);

    const immolationAuraUptimePercentage = immolationAuraUptime / this.owner.fightDuration;

    this.immolationAuraDamage = this.abilityTracker.getAbility(SPELLS.IMMOLATION_AURA_FIRST_STRIKE.id).damageEffective + this.abilityTracker.getAbility(SPELLS.IMMOLATION_AURA_BUFF.id).damageEffective;



    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(4)}
        icon={<SpellIcon id={SPELLS.IMMOLATION_AURA.id} />}
        value={`${formatPercentage(immolationAuraUptimePercentage)}%`}
        label="Immolation Aura uptime"
        tooltip={<>The Immolation Aura total damage was {formatThousands(this.immolationAuraDamage)}.<br />The Immolation Aura total uptime was {formatDuration(immolationAuraUptime / 1000)}</>}
      />
    );
  }
}

export default ImmolationAura;
