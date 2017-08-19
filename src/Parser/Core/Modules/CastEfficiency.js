import React from 'react';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';

import Tab from 'Main/Tab';
import CastEfficiencyComponent from 'Main/CastEfficiency';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

class CastEfficiency extends Module {
  static SPELL_CATEGORIES = [
    {
      ROTATIONAL: 'Rotational Spell',
    },
    {
      ROTATIONAL_AOE: 'Spell (AOE)',
    },
    {
      COOLDOWNS: 'Cooldown',
    },
    {
      OTHERS: 'Spell',
    },
  ];

  static CPM_ABILITIES = [
    {
      spell: SPELLS.SUMMON_DREAD_REFLECTION,
      getCooldown: haste => 45,
      isActive: combatant => combatant.hasTrinket(ITEMS.SPECTER_OF_BETRAYAL.id),
    },
    {
      spell: SPELLS.CEASELESS_TOXIN,
      getCooldown: haste => 60,//add detection if target has died and reduced cooldown
      isActive: combatant => combatant.hasTrinket(ITEMS.VIAL_OF_CEASELESS_TOXINS.id),
    },
  ];

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
        <Tab title="Cast efficiency">
          <CastEfficiencyComponent
            categories={this.constructor.SPELL_CATEGORIES}
            abilities={getCastEfficiency(this.constructor.CPM_ABILITIES, this.owner)}
          />
        </Tab>
      ),
    };
  }
}

export default CastEfficiency;
