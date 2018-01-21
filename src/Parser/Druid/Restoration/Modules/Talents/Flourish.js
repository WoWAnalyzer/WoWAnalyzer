import React from 'react';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import HotTracker from '../Core/HotTracking/HotTracker';

const debug = false;

const FLOURISH_EXTENSION = 6000;

// TODO: Idea - Give suggestions on low amount/duration extended with flourish on other HoTs
class Flourish extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTracker,
  };

  flourishAttribution = { name: 'Flourish', healing: 0, masteryHealing: 0, dreamwalkerHealing: 0, procs: 0 };

  flourishes = [];

  hasCenarionWard = false;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FLOURISH_TALENT.id);
    this.hasCenarionWard =  this.combatants.selected.hasTalent(SPELLS.CENARION_WARD_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.FLOURISH_TALENT.id !== spellId) {
      return;
    }
    debug && console.log(`Flourish cast #: ${this.flourishCount}`);
    this.flourishCount += 1;

    Object.keys(this.hotTracker.hots).forEach(playerId => {
      Object.keys(this.hotTracker.hots[playerId]).forEach(spellId => {
        this.hotTracker.addExtension(this.flourishAttribution, FLOURISH_EXTENSION, playerId, spellId);
      });
    });
  }

  _hotCount(hotId, timestamp) {
    return Object.values(this.combatants.players)
        .reduce((total, player) => total += (player.hasBuff(hotId, timestamp, 0, 0) ? 1 : 0), 0);
  }

  get percentWgsExtended() {
    return (this.wildGrowthCasts / this.flourishCount) || 0;
  }

  get wildGrowthSuggestionThresholds() {
    return {
      actual: this.percentWgsExtended,
      isLessThan: {
        minor: 1.00,
        average: 0.75,
        major: 0.50,
      },
      style: 'percentage',
    };
  }

  get percentCwsExtended() {
    return (this.cenarionWard / this.flourishCount) || 0;
  }

  get cenarionWardSuggestionThresholds() {
    return {
      actual: this.percentCwsExtended,
      isLessThan: {
        minor: 1.00,
        average: 0.00,
        major: 0.00,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    if(this.flourishCount === 0) {
      return;
    }

    when(this.wildGrowthSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.FLOURISH_TALENT.id} /> should always aim to extend a <SpellLink id={SPELLS.WILD_GROWTH.id} /></Wrapper>)
          .icon(SPELLS.FLOURISH_TALENT.icon)
          .actual(`${formatPercentage(this.wildGrowthCasts / this.flourishCount, 0)}% WGs extended.`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });

    if(this.hasCenarionWard) {
      when(this.cenarionWardSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>Your <SpellLink id={SPELLS.FLOURISH_TALENT.id} /> should always aim to extend a <SpellLink id={SPELLS.CENARION_WARD.id} /></Wrapper>)
            .icon(SPELLS.FLOURISH_TALENT.icon)
            .actual(`${this.cenarionWard}/${this.flourishCount} CWs extended.`)
            .recommended(`${formatPercentage(recommended)}% is recommended`);
        });
    }
  }

  statistic() {
    const totalHotsExtended = this.flourishes.reduce((total, flourish) => total += flourish.count, 0);
    const avgHotsExtended = (totalHotsExtended / this.flourishCount) || 0;

    return(
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.FLOURISH_TALENT.id} />}
        value={`${avgHotsExtended.toFixed(1)}`}
        label="Average HoTs Extended"
        tooltip={
          `The average and per Flourish counts do <i>not</i> include Cultivation due to its refresh mechanic.<br>
          Your ${this.flourishCount} Flourish casts extended:
          <ul>
            <li>${this.wildGrowthCasts}/${this.flourishCount} Wild Growth casts (${this.wildGrowth} HoTs)</li>
            ${this.hasCenarionWard
              ? `<li>${this.cenarionWard}/${this.flourishCount} Cenarion Wards</li>`
              : ``
            }
            ${this.rejuvenation > 0
              ? `<li>${this.rejuvenation} Rejuvenations</li>`
              : ``
            }
            ${this.regrowth > 0
              ? `<li>${this.regrowth} Regrowths</li>`
              : ``
            }
            ${this.lifebloom > 0
              ? `<li>${this.lifebloom} Lifebloom</li>`
              : ``
            }
            ${this.springBlossoms > 0
              ? `<li>${this.springBlossoms} Spring Blossoms</li>`
              : ``
            }
            ${this.dreamer > 0
              ? `<li>${this.dreamer} Dreamer (T21)</li>`
              : ``
            }
            ${this.cultivation > 0
              ? `<li>${this.cultivation} Cultivations (not counted in total)</li>`
              : ``
            }
          </ul>
          <br>
          The 'HoT Power' column gives an indication of the total power of extending each HoT by 6 seconds, expressed as a percentage of your spell power. This value considers only the base power of each HoT (and the +15% to rejuvenation from the first point in your artifact weapon). It does not factor in overhealing or any of your secondary stats.`
        }
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast</th>
              <th># of HoTs</th>
              <th>HoT Power</th>
            </tr>
          </thead>
          <tbody>
            {
              this.flourishes.map((element, index) => (
                <tr key={index}>
                  <th scope="row">{ index + 1 }</th>
                  <td>{ element.count }</td>
                  <td>{ element.weightedPower }% SP</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();


}

export default Flourish;
