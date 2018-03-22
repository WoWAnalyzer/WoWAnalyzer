import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';

class Bonestorm extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bsCasts = [];
  cast = 0;
  totalBonestormDamage = 0;
  totalHits = 0;
  totalCost = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BONESTORM_TALENT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.BONESTORM_TALENT.id) {
      return;
    }

    this.bsCasts.push({
      timestamp: event.timestamp,
      expire: event.timestamp + (event.classResources[0].cost * 10),
      cost: event.classResources[0].cost,
      hits: [],
      cast: this.cast,
    });
    this.cast += 1;
    this.totalCost += event.classResources[0].cost;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.BONESTORM_HIT.id) {
      return;
    }

    this.bsCasts.forEach((bsCast, index) => {
      if ((bsCast.cast + 1) === this.cast) {
        this.totalHits += 1;
        this.bsCasts[index].hits.push(event.amount + event.absorbed);
        this.totalBonestormDamage += event.amount + event.absorbed;
      }
    });
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: formatNumber(this.totalHits / (this.totalCost / 100)),
      isLessThan: {
        minor: 2,
        major: 1.9,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>Try to cast <SpellLink id={SPELLS.BONESTORM_TALENT.id} /> only if you can reliable hit 2 or more targets to maximize the damage and healing. Casting <SpellLink id={SPELLS.BONESTORM_TALENT.id} /> with only one target in range is a DPS and HPS loss, use <SpellLink id={SPELLS.DEATH_STRIKE.id} /> instead.</Wrapper>)
            .icon(SPELLS.BONESTORM_TALENT.icon)
            .actual(`${ actual } average targets`)
            .recommended(`${ recommended } or more is recommended`);
        });
  }

  get BonestormTooltip() {
    let tooltip = "";
    this.bsCasts.forEach((cast, index) => {
      const avgDamage = formatNumber(cast.hits.reduce((a, b) => { return a + b; }, 0) / cast.hits.length);
      const totalDamage  = formatNumber(cast.hits.reduce((a, b) => { return a + b; }, 0));
      const avgHits = formatNumber(cast.hits.length / cast.cost * 100, 1);
      const rpCost = formatNumber(cast.cost / 10);

      tooltip += `Cast #${cast.cast + 1} (for ${ rpCost } RP) hit an average of ${ avgHits } target${ avgHits <= 1 ? '' : 's' } for ${ avgDamage } per hit. (${ totalDamage } total)<br>`;
    });
    return tooltip;
  }

  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BONESTORM_TALENT.id} />}
        value={`${ formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalBonestormDamage)) } %`}
        label="of your total damage"
        tooltip={`${ this.BonestormTooltip }`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Bonestorm;
