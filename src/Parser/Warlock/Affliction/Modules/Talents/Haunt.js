import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';

const HAUNT_DAMAGE_BONUS = 0.1;

class Haunt extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  bonusDmg = 0;
  totalTicks = 0;
  buffedTicks = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HAUNT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    const hasHaunt = target.hasBuff(SPELLS.HAUNT_TALENT.id, event.timestamp);

    if (UNSTABLE_AFFLICTION_DEBUFF_IDS.includes(event.ability.guid)) {
      this.totalTicks += 1;
      if (hasHaunt) {
        this.buffedTicks += 1;
      }
    }

    if (hasHaunt) {
      this.bonusDmg += calculateEffectiveDamage(event, HAUNT_DAMAGE_BONUS);
    }
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.HAUNT_TALENT.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.75,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>
            Your <SpellLink id={SPELLS.HAUNT_TALENT.id} /> debuff uptime is too low. While it's usually not possible to get 100% uptime due to travel and cast time, you should aim for as much uptime on the debuff as possible.
          </React.Fragment>
        )
          .icon(SPELLS.HAUNT_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Haunt uptime.`)
          .recommended(`> ${formatPercentage(recommended)}% is recommended`);
      });
  }

  subStatistic() {
    const buffedTicksPercentage = (this.buffedTicks / this.totalTicks) || 1;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.HAUNT_TALENT.id} /> uptime
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Your Haunt talent contributed ${formatNumber(this.bonusDmg)} total damage with its 10% damage buff (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} % of total damage done). You buffed ${formatPercentage(buffedTicksPercentage)} % of your Unstable Affliction ticks with Haunt.`}>
            {formatPercentage(this.uptime)} %
          </dfn>
        </div>
      </div>
    );
  }

  statistic() {
    const buffedTicksPercentage = (this.buffedTicks / this.totalTicks) || 1;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HAUNT_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Haunt uptime"
        tooltip={`Your Haunt talent contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %). You buffed ${formatPercentage(buffedTicksPercentage)} % of your Unstable Affliction ticks with Haunt.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(0);
}

export default Haunt;
