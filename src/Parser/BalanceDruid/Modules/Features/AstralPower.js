import React from 'react';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import ResourceTypes from 'common/RESOURCE_TYPES';

class AstralPower extends Module {
  
  lastAstral = 0;
  aspWasted = 0;

  on_toPlayer_energize(event) {
      for (let i = 0; i < event.classResources.length; i++) {
          if (event.classResources[i].type === ResourceTypes.ASTRAL_POWER){
              const maxAsP = event.classResources[i].max;
              const addedAsP = event.resourceChange * 10;

              if (this.lastAstral + addedAsP > maxAsP){
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
      
      for (let i = 0; i<event.classResources.length; i++) {
          if (event.classResources[i].type === ResourceTypes.ASTRAL_POWER){
              if (event.classResources[i].cost) {
                  this.lastAstral = this.lastAstral - (event.classResources[i].cost);
              }
          }
      }
  }

  suggestions(when) {
      when(this.aspWasted).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You overcapped {this.aspWasted / 10} Astral Power. Always prioritize spending it over avoiding the overcap or any other ability.</span>)
            .icon('ability_druid_cresentburn')
            .actual(`${this.aspWasted / 10} overcapped Astral Power`)
            .recommended(`0 overcapped Astral Power is recommended.`)
            .regular(recommended + 300).major(recommended + 300);
        });
    }
  
    statistic() {
        if (this.aspWasted > 0){
          return (
          <StatisticBox
              icon={<Icon icon='ability_druid_cresentburn' />}
              value={`${this.aspWasted / 10}`}
              label='Overcapped AsP'
              tooltip={`You overcapped a total of <b>${this.aspWasted / 10}</b> Astral Power`}
          />
          );
      }
    }
    statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default AstralPower;
