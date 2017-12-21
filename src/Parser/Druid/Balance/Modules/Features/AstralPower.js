import React from 'react';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import ResourceTypes from 'common/RESOURCE_TYPES';

class AstralPower extends Analyzer {
  lastAstral = 0;
  aspWasted = 0;

  on_toPlayer_energize(event) {
    if (!event.classResources) { return; }
    for (let i = 0; i < event.classResources.length; i += 1) {
      if (event.classResources[i].type === ResourceTypes.ASTRAL_POWER) {
        const maxAsP = event.classResources[i].max;
        const addedAsP = event.resourceChange * 10;

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

  suggestions(when) {
    const wastedPerMin = ((this.aspWasted) / (this.owner.fightDuration / 100)) * 60;
    when(wastedPerMin).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You overcapped {this.aspWasted / 10} Astral Power. Always prioritize spending it over avoiding the overcap or any other ability.</span>)
            .icon('ability_druid_cresentburn')
            .actual(`${formatNumber(actual)} overcapped Astral Power per minute`)
            .recommended('0 overcapped Astral Power is recommended.')
            .regular(recommended + 4).major(recommended + 8);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="ability_druid_cresentburn" />}
        value={`${this.aspWasted / 10}`}
        label="Overcapped AsP"
        tooltip="Astral Power overcapping is often due to mismanagement of resources, but can also be due to an overwhelming amount of OI procs."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AstralPower;
