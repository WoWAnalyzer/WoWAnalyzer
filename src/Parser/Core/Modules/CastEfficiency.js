import React from 'react';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';

import CastEfficiencyTab from 'Main/CastEfficiencyTab';

class CastEfficiency extends Module {
  static CPM_ABILITIES = [];
  static SPELL_CATEGORIES = [];

  suggestions(when) {
    const castEfficiency = getCastEfficiency(this.constructor.CPM_ABILITIES, this.owner);
    castEfficiency.forEach(cpm => {
      if (cpm.ability.noSuggestion || cpm.castEfficiency === null) {
        return;
      }
      when(cpm.castEfficiency).isLessThan(cpm.recommendedCastEfficiency)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Try to cast <SpellLink id={cpm.ability.spell.id} /> more often. {cpm.ability.extraSuggestion || ''}</span>)
            .icon(cpm.ability.spell.icon)
            .actual(`${cpm.casts} out of ${cpm.maxCasts} possible casts; ${formatPercentage(actual)}% cast efficiency`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15).staticImportance(cpm.ability.importance);
        });
    });
  }
  tab() {
    return {
      title: 'Cast efficiency',
      url: 'cast-efficiency',
      render: () => (
        <CastEfficiencyTab
          categories={this.constructor.SPELL_CATEGORIES}
          abilities={getCastEfficiency(this.constructor.CPM_ABILITIES, this.owner)}
        />
      ),
    };
  }
}

export default CastEfficiency;
