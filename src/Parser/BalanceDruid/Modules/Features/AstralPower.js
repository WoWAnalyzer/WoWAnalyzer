import React from 'react';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

class AstralPower extends Module {
  
  lastAstral = 0;
  aspWasted = 0;

  on_toPlayer_energize(event) {
      for (let i = 0; i < event.classResources.length; i++) {
          if (event.classResources[i].type === 8){
              const maxAsP = event.classResources[i].max / 10;
              const addedAsP = event.resourceChange;

              if (this.lastAstral + addedAsP > maxAsP){
                  this.aspWasted += this.lastAstral + addedAsP - maxAsP;
              }

              this.lastAstral = event.classResources[i].amount / 10;
          }
      }
  }

  on_byPlayer_cast(event) {
      const spellId = event.ability.guid;
      if (SPELLS.STARSURGE_MOONKIN.id !== spellId && SPELLS.STARFALL.id !== spellId && SPELLS.STARFALL_CAST.id !== spellId) {
          return;
      }
      
      for (let i = 0; i<event.classResources.length; i++) {
          if (event.classResources[i].type === 8){
              if (event.classResources[i].cost) {
                  this.lastAstral = this.lastAstral - (event.classResources[i].cost / 10);
              }
          }
      }
  }

  suggestions(when) {
      when(this.aspWasted).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You wasted {this.aspWasted} Astral Power.</span>)
            .icon(SPELLS.SOLAR_WRATH_MOONKIN.icon)
            .actual(`${this.aspWasted} wasted Astral Power`)
            .recommended(`You shouldn't waste any Astral Power, always prioritize spending it over avoiding the overcap or any other ability.`)
            .regular(recommended).major(recommended + 15);
        });
    }
  
    statistic() {
        if (this.aspWasted > 0){
          return (
          <StatisticBox
              icon={<Icon icon='ability_druid_cresentburn' />}
              value={`${this.aspWasted}`}
              label='Wasted AsP'
              tooltip={`You wasted a total of <b>${this.aspWasted}</b> Astral Power`}
          />
          );
      }
    }
    statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default AstralPower;
