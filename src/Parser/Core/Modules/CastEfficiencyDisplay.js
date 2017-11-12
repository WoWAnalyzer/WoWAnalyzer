import React from 'react';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';
import SpellHistory from 'Parser/Core/Modules/SpellHistory';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';

import Tab from 'Main/Tab';
import CastEfficiencyComponent from 'Main/CastEfficiency';
import SpellTimeline from 'Main/Timeline/SpellTimeline';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import AbilityTracker from './AbilityTracker';
import Combatants from './Combatants';
import Haste from './Haste';

const DEFAULT_MINOR_SUGGEST = 0.80;
const DEFAULT_AVERAGE_SUGGEST = 0.75;
const DEFAULT_MAJOR_SUGGEST = 0.65;

// This needs to be in own class to avoid circular dependency
// TODO rename CastEfficiency to CastInfo, and rename this to CastEfficiency
class CastEfficiencyDisplay extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
    haste: Haste,
    spellHistory: SpellHistory,
    castEfficiency: CastEfficiency,
  };

  /*
   * Gets the number of ms the given spell has been on CD since the beginning of the fight.
   * Only works on spells entered into CastEfficiency list.
   */
  _getTimeOnCooldown(spellId) {
    const history = this.spellHistory.historyBySpellId[spellId];
    if(!history) {
      return;
    }

    let lastBeginTimestamp = null;
    const nonEndTimeOnCd = history
        .filter(event => event.type === 'updatespellusable')
        .reduce((acc, event) => {
          if(event.trigger === 'begincooldown') {
            lastBeginTimestamp = event.timestamp;
            return acc;
          } else if(event.trigger === 'endcooldown') {
            lastBeginTimestamp = null;
            return acc + event.timePassed;
          }
        }, 0);
    const endTimeOnCd = (!lastBeginTimestamp) ? 0 : this.owner.currentTimestamp - lastBeginTimestamp;
    return nonEndTimeOnCd + endTimeOnCd;
  }

  suggestions(when) {
    const castInfo = this.castEfficiency.constructor.CPM_ABILITIES;
    castInfo.forEach(ability => {
      const spellId = ability.spell.id;
      // TODO better way than 'cooldown === null' to detect that I shouldn't be making a suggestion
      const cooldown = this.castEfficiency.getExpectedCooldownDuration(spellId);
      if (ability.noSuggestion || !cooldown) {
        return;
      }
      const timeOnCd = this._getTimeOnCooldown(spellId);
      const percentOnCd = (timeOnCd / this.owner.fightDuration) || 0;

      const trackedAbility = this.abilityTracker.getAbility(spellId);
      const casts = (ability.getCasts ? ability.getCasts(trackedAbility, this.owner) : trackedAbility.casts) || 0; // TODO what the fuck does this do
      if (ability.isUndetectable && casts === 0) {
        // Some spells (most notably Racials) can not be detected if a player has them. This hides those spells if they have 0 casts.
        return null;
      }

      const maxCasts = 0; // TODO implement

      const minorSuggest = ability.recommendedCastEfficiency || DEFAULT_MINOR_SUGGEST;
      const averageSuggest = ability.averageIssueCastEfficiency || DEFAULT_AVERAGE_SUGGEST;
      const majorSuggest = ability.majorIssueCastEfficiency || DEFAULT_MAJOR_SUGGEST;

      when(percentOnCd).isLessThan(minorSuggest)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Try to cast <SpellLink id={spellId} /> more often. {ability.extraSuggestion || ''} <a href="#spell-timeline">View timeline</a>.</span>)
            .icon(ability.spell.icon)
            .actual(`${casts} out of ${maxCasts} possible casts; ${formatPercentage(actual)}% cast efficiency`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .details(() => (
              <div style={{ margin: '0 -22px' }}>
                <SpellTimeline
                  historyBySpellId={this.owner.modules.spellHistory.historyBySpellId}
                  castEfficiency={this.castEfficiency}
                  spellId={spellId}
                  start={this.owner.fight.start_time}
                  end={this.owner.currentTimestamp}
                />
              </div>
            ))
            .regular(averageSuggest).major(majorSuggest).staticImportance(ability.importance);
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
            categories={this.castEfficiency.constructor.SPELL_CATEGORIES}
            abilities={getCastEfficiency(this.castEfficiency.constructor.CPM_ABILITIES, this.abilityTracker, this.combatants, this.owner)}
          />
        </Tab>
      ),
    };
  }
}

export default CastEfficiencyDisplay;
