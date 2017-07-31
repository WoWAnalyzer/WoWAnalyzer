import React from 'react';

import CPM_ABILITIES, { SPELL_CATEGORY } from './CPM_ABILITIES';
import Icon from 'common/Icon';
import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import SpellLink from 'common/SpellLink';
import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import TalentsTab from 'Main/TalentsTab';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';


function getIssueImportance(value, regular, major, higherIsWorse = false) {
  if (higherIsWorse ? value > major : value < major) {
    return ISSUE_IMPORTANCE.MAJOR;
  }
  if (higherIsWorse ? value > regular : value < regular) {
    return ISSUE_IMPORTANCE.REGULAR;
  }
  return ISSUE_IMPORTANCE.MINOR;
}

function formatThousands(number) {
  return (Math.round(number || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function formatNumber(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}

class CombatLogParser extends MainCombatLogParser {

  static specModules = {
    
  };

  generateResults() {
    const results = super.generateResults();
    
    const fightDuration = this.fightDuration;
    
    const castEfficiencyCategories = SPELL_CATEGORY;
    const castEfficiency = getCastEfficiency(CPM_ABILITIES, this);
    castEfficiency.forEach((cpm) => {
      if (cpm.canBeImproved && !cpm.ability.noSuggestion) {
        results.addIssue({
          issue: <span>Try to cast <SpellLink id={cpm.ability.spell.id} /> more often ({cpm.casts}/{cpm.maxCasts} casts: {Math.round(cpm.castEfficiency * 100)}% cast efficiency). {cpm.ability.extraSuggestion || ''}</span>,
          icon: cpm.ability.spell.icon,
          importance: cpm.ability.importance || getIssueImportance(cpm.castEfficiency, cpm.recommendedCastEfficiency - 0.05, cpm.recommendedCastEfficiency - 0.15),
        });
      }
    });

    results.tabs = [
      {
        title: 'Suggestions',
        url: 'suggestions',
        render: () => (
          <SuggestionsTab issues={results.issues} />
        ),
      },
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <TalentsTab combatant={this.selectedCombatant} />
        ),
      },
    ];
    
    results.statistics = [
      <StatisticBox
        icon={ <Icon icon="class_rogue" alt="Damage Per Second" /> }
        value={`${formatNumber(this.totalDamageDone / fightDuration * 1000)} DPS`}
        label={(
          <dfn data-tip={`The total damage done recorded was ${formatThousands(this.totalDamageDone)}.`}>
            Damage done
          </dfn>
        )}
      />,
      ...results.statistics,
    ];

    return results;
  }
}

export default CombatLogParser;
