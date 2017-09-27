import React from 'react';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SuggestionThresholds from '../../SuggestionThresholds';

const debug = false;
const FLOURISH_EXTENSION_SECONDS = 6;

// TODO: Idea - Give suggestions on low amount/duration extended with flourish on other HoTs
class Flourish extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  flourishCounter = 0;
  wildGrowth = 0;
  rejuvenation = 0;
  regrowth = 0;
  cultivation = 0;
  cenarionWard = 0;
  lifebloom = 0;
  springBlossoms = 0;

  wildGrowthTargets = 6; // TODO handle extra targets during ToL

  hasGermination = false;
  hasSpringBlossoms = false;
  hasCenarionWard = false;
  hasCultivation = false;
  hasTreeOfLife = false;

  // TODO: We may want to store all the HoTs instead of the amount of hots in here in the future
  flourishes = [];
  hotCount = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FLOURISH_TALENT.id);

    this.hasGermination = this.combatants.selected.hasTalent(SPELLS.GERMINATION_TALENT.id);
    this.hasSpringBlossoms = this.combatants.selected.hasTalent(SPELLS.SPRING_BLOSSOMS_TALENT.id);
    this.hasCenarionWard = this.combatants.selected.hasTalent(SPELLS.CENARION_WARD_TALENT.id);
    this.hasCultivation = this.combatants.selected.hasTalent(SPELLS.CULTIVATION_TALENT.id);
    this.hasTreeOfLife = this.combatants.selected.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.FLOURISH.id !== spellId) {
      return;
    }
    debug && console.log(`Flourish cast #: ${this.flourishCounter}`);
    this.flourishCounter += 1;

    // Wild growth
    const oldWgCount = this.wildGrowth;
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (player.hasBuff(SPELLS.WILD_GROWTH.id, event.timestamp, 0, 0) === true) {
          this.wildGrowth += 1;
          this.hotCount += 1;
        }
      });
    // If we are using Tree Of Life, our WG statistics will be a little skewed since each WG gives 8 WG applications instead of 6.
    // We solve this by simply reducing WGs counter by 2.
    if (this.wildGrowth > (oldWgCount + 6)) {
      this.wildGrowth = this.wildGrowth - 2;
    }

    // Rejuvenation
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (player.hasBuff(SPELLS.REJUVENATION.id, event.timestamp, 0, 0) === true) {
          this.rejuvenation += 1;
          this.hotCount += 1;
        }
        if (this.hasGermination) {
          if (player.hasBuff(SPELLS.REJUVENATION_GERMINATION.id, event.timestamp, 0, 0) === true) {
            this.rejuvenation += 1;
            this.hotCount += 1;
          }
        }
      });

    // Regrowth
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (player.hasBuff(SPELLS.REGROWTH.id, event.timestamp, 0, 0) === true) {
          this.regrowth += 1;
          this.hotCount += 1;
        }
      });

    // Cultivation
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (this.hasCultivation) {
          if (player.hasBuff(SPELLS.CULTIVATION.id, event.timestamp, 0, 0) === true) {
            this.cultivation += 1;
            this.hotCount += 1;
          }
        }
      });

    // Cenarion Ward
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (this.hasCenarionWard) {
          if (player.hasBuff(SPELLS.CENARION_WARD.id, event.timestamp, 0, 0) === true) {
            this.cenarionWard += 1;
            this.hotCount += 1;
          }
        }
      });

    // Lifebloom
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (player.hasBuff(SPELLS.LIFEBLOOM_HOT_HEAL.id, event.timestamp, 0, 0) === true) {
          this.lifebloom += 1;
          this.hotCount += 1;
        }
      });

    // Spring blossoms
    Object.keys(this.combatants.players)
      .map(player => this.combatants.players[player])
      .forEach((player) => {
        if (this.hasSpringBlossoms) {
          if (player.hasBuff(SPELLS.SPRING_BLOSSOMS.id, event.timestamp, 0, 0) === true) {
            this.springBlossoms += 1;
            this.hotCount += 1;
          }
        }
      });

    this.flourishes.push(this.hotCount);
    this.hotCount = 0;
  }

  suggestions(when) {
    if(this.flourishCounter === 0) {
      return;
    }

    const wgsExtended = (this.wildGrowth / this.wildGrowthTargets) / this.flourishCounter;
    when(wgsExtended).isLessThan(SuggestionThresholds.FLOURISH_WG_EXTEND.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.FLOURISH.id} /> should always aim to extend a <SpellLink id={SPELLS.WILD_GROWTH.id} /></span>)
          .icon(SPELLS.FLOURISH.icon)
          .actual(`${formatPercentage((this.wildGrowth / 6) / this.flourishCounter, 0)}% WGs extended.`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(SuggestionThresholds.FLOURISH_WG_EXTEND.regular).major(SuggestionThresholds.FLOURISH_WG_EXTEND.major);
      });

    if(this.hasCenarionWard) {
      const cwsExtended = this.cenarionWard / this.flourishCounter;
      when(cwsExtended).isLessThan(SuggestionThresholds.FLOURISH_CW_EXTEND.minor)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your <SpellLink id={SPELLS.FLOURISH.id} /> should always aim to extend a <SpellLink id={SPELLS.CENARION_WARD.id} /></span>)
            .icon(SPELLS.FLOURISH.icon)
            .actual(`${this.cenarionWard}/${this.flourishCounter} CWs extended.`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(SuggestionThresholds.FLOURISH_CW_EXTEND.regular).major(SuggestionThresholds.FLOURISH_CW_EXTEND.major);
        });
    }
  }

  statistic() {
    return(
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.FLOURISH_TALENT.id} />}
        value={`${((((this.wildGrowth + this.cenarionWard + this.rejuvenation + this.regrowth + this.lifebloom + this.springBlossoms + this.cultivation) * 6) / this.flourishCounter).toFixed(0) | 0)}s`}
        label="Average Flourish usage"
        tooltip={
          `<ul>
              Your ${this.flourishCounter} Flourishes extended:
              <li>${this.wildGrowth}/${this.flourishCounter * this.wildGrowthTargets} Wild Growths</li>
              <li>${this.cenarionWard}/${this.flourishCounter} Cenarion Wards</li>
              ${this.rejuvenation > 0 ?
            `<li>${this.rejuvenation} Rejuvenations</li>`
            : ''
            }
                      ${this.regrowth > 0 ?
            `<li>${this.regrowth} Regrowths</li>`
            : ''
            }
                      ${this.lifebloom > 0 ?
            `<li>${this.lifebloom} Lifeblooms</li>`
            : ''
            }
                      ${this.springBlossoms > 0 ?
            `<li>${this.springBlossoms} Spring Blossoms</li>`
            : ''
            }
                      ${this.cultivation > 0 ?
            `<li>${this.cultivation} Cultivations</li>`
            : ''
            }
          </ul>`
        }
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast</th>
              <th>Duration</th>
              <th># of HoTs</th>
            </tr>
          </thead>
          <tbody>
            {
              this.flourishes.map((element, index) => (
                <tr key={index}>
                  <th scope="row">{ index + 1 }</th>
                  <td>{ element * FLOURISH_EXTENSION_SECONDS }s</td>
                  <td>{ element }</td>
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
