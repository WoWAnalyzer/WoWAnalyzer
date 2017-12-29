import React from 'react';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import ResourceTypes from 'common/RESOURCE_TYPES';
import { formatDuration, formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';

class AstralPower extends Analyzer {
  lastAstral = 0;
  aspWasted = 0;
  aspGenerated = 0;

  on_toPlayer_energize(event) {
    if (!event.classResources) { return; }
    for (let i = 0; i < event.classResources.length; i += 1) {
      if (event.classResources[i].type === ResourceTypes.ASTRAL_POWER) {
        const maxAsP = event.classResources[i].max;
        const addedAsP = event.resourceChange * 10;
        this.aspGenerated += addedAsP;

        if (this.lastAstral + addedAsP > maxAsP) {
          this.aspWasted += this.lastAstral + addedAsP - maxAsP;
        }

        this.lastAstral = event.classResources[i].amount;
      }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.STARSURGE_MOONKIN.id !== spellId && SPELLS.STARFALL.id !== spellId && SPELLS.STARFALL_CAST.id !== spellId) {
      return;
    }

    for (let i = 0; i < event.classResources.length; i += 1) {
      if (event.classResources[i].type === ResourceTypes.ASTRAL_POWER) {
        if (event.classResources[i].cost) {
          this.lastAstral = this.lastAstral - (event.classResources[i].cost);
        }
      }
    }
  }

  get wastedPercentage() {
    return this.aspWasted / this.aspGenerated;
  }

  get wasted() {
    return this.aspWasted / 10;
  }

  get generated() {
    return this.aspGenerated / 10;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercentage,
      isLessThan: {
        minor: 1.00,
        average: 0.98,
        major: 0.95,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.wastedPercentage).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>You overcapped {this.wasted} Astral Power. Always prioritize spending it over avoiding the overcap or any other ability.</Wrapper>)
            .icon('ability_druid_cresentburn')
            .actual(`${formatPercentage(this.wastedPercentage)}% overcapped Astral Power per minute`)
            .recommended('0 overcapped Astral Power is recommended.')
            .regular(0.02).major(0.05);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="ability_druid_cresentburn" />}
        value={`${this.wasted}`}
        label="Overcapped AsP"
        tooltip={`${this.wasted} out of ${this.generated} (${formatPercentage(this.wastedPercentage)}%) Astral Power wasted.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default AstralPower;
