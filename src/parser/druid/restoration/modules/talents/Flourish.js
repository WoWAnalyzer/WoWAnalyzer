import React from 'react';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import StatisticBox from 'interface/others/StatisticBox';
import { formatPercentage, formatNumber } from 'common/format';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import HotTracker from '../core/hottracking/HotTracker';

import { HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR } from '../../constants';
import Events from 'parser/core/Events';

const debug = false;

const FLOURISH_EXTENSION = 8000;
const FLOURISH_HEALING_INCREASE = 1;
/*
  Extends the duration of all of your heal over time effects on friendly targets within 60 yards by 8 sec,
  and increases the rate of your heal over time effects by 100% for 8 sec.
 */
// TODO: Idea - Give suggestions on low amount/duration extended with flourish on other HoTs
class Flourish extends Analyzer {
  static dependencies = {
    hotTracker: HotTracker,
  };

  // Counters for hot extension
  flourishCount = 0;
  flourishes = [];

  wgsExtended = 0; // tracks how many flourishes extended Wild Growth
  cwsExtended = 0; // tracks how many flourishes extended Cenarion Ward
  tranqsExtended = 0;

  hasCenarionWard = false;

  rejuvCount = 0;
  wgCount = 0;
  lbCount = 0;
  regrowthCount = 0;
  sbCount = 0;
  cultCount = 0;
  tranqCount = 0;
  groveTendingCount = 0;

  // Counters for increased ticking rate of hots
  increasedRateTotalHealing = 0;

  increasedRateRejuvenationHealing = 0;
  increasedRateWildGrowthHealing = 0;
  increasedRateCenarionWardHealing = 0;
  increasedRateCultivationHealing = 0;
  increasedRateLifebloomHealing = 0;
  increasedRateRegrowthHealing = 0;
  increasedRateTranqHealing = 0;
  increasedRateGroveTendingHealing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FLOURISH_TALENT.id);
    this.hasCenarionWard = this.selectedCombatant.hasTalent(SPELLS.CENARION_WARD_TALENT.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(HOTS_AFFECTED_BY_ESSENCE_OF_GHANIR), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLOURISH_TALENT), this.onCast);
  }

  onHeal(event) {
    const spellId = event.ability.guid;

    if (this.selectedCombatant.hasBuff(SPELLS.FLOURISH_TALENT.id)) {
      switch (spellId) {
        case SPELLS.REJUVENATION.id:
          this.increasedRateRejuvenationHealing += calculateEffectiveHealing(event, FLOURISH_HEALING_INCREASE);
          break;
        case SPELLS.REJUVENATION_GERMINATION.id:
          this.increasedRateRejuvenationHealing += calculateEffectiveHealing(event, FLOURISH_HEALING_INCREASE);
          break;
        case SPELLS.WILD_GROWTH.id:
          this.increasedRateWildGrowthHealing += calculateEffectiveHealing(event, FLOURISH_HEALING_INCREASE);
          break;
        case SPELLS.CENARION_WARD_HEAL.id:
          this.increasedRateCenarionWardHealing += calculateEffectiveHealing(event, FLOURISH_HEALING_INCREASE);
          break;
        case SPELLS.CULTIVATION.id:
          this.increasedRateCultivationHealing += calculateEffectiveHealing(event, FLOURISH_HEALING_INCREASE);
          break;
        case SPELLS.LIFEBLOOM_HOT_HEAL.id:
          this.increasedRateLifebloomHealing += calculateEffectiveHealing(event, FLOURISH_HEALING_INCREASE);
          break;
        case SPELLS.GROVE_TENDING.id:
          this.increasedRateGroveTendingHealing += calculateEffectiveHealing(event, FLOURISH_HEALING_INCREASE);
          break;
        case SPELLS.REGROWTH.id:
          if (event.tick === true) {
            this.increasedRateRegrowthHealing += calculateEffectiveHealing(event, FLOURISH_HEALING_INCREASE);
          }
          break;
        case SPELLS.TRANQUILITY_HEAL.id:
          if (event.tick === true) {
            this.increasedRateTranqHealing += calculateEffectiveHealing(event, FLOURISH_HEALING_INCREASE);
          }
          break;
        default:
          console.error('EssenceOfGhanir: Error, could not identify this object as a HoT: %o', event);
      }

      if ((SPELLS.REGROWTH.id === spellId || SPELLS.TRANQUILITY_HEAL.id) && event.tick !== true) {
        return;
      }
      this.increasedRateTotalHealing += calculateEffectiveHealing(event, FLOURISH_HEALING_INCREASE);
    }
  }

  onCast(event) {
    this.flourishCount += 1;
    debug && console.log(`Flourish cast #: ${this.flourishCount}`);

    const newFlourish = {
      name: `Flourish #${this.flourishCount}`,
      healing: 0,
      masteryHealing: 0,
      procs: 0,
      duration: 0,
    };
    this.flourishes.push(newFlourish);

    let foundWg = false;
    let foundCw = false;
    let foundTranq = false;

    Object.keys(this.hotTracker.hots).forEach(playerId => {
      Object.keys(this.hotTracker.hots[playerId]).forEach(spellIdString => {
        const spellId = Number(spellIdString);
        // due to flourish's refresh mechanc, we don't include it in Flourish numbers
        const attribution = spellId === SPELLS.CULTIVATION.id ? null : newFlourish;
        this.hotTracker.addExtension(attribution, FLOURISH_EXTENSION, playerId, spellId);

        if (spellId === SPELLS.WILD_GROWTH.id) {
          foundWg = true;
          this.wgCount += 1;
        } else if (spellId === SPELLS.CENARION_WARD_HEAL.id) {
          foundCw = true;
        } else if (spellId === SPELLS.REJUVENATION.id || spellId === SPELLS.REJUVENATION_GERMINATION.id) {
          this.rejuvCount += 1;
        } else if (spellId === SPELLS.REGROWTH.id) {
          this.regrowthCount += 1;
        } else if (spellId === SPELLS.LIFEBLOOM_HOT_HEAL.id) {
          this.lbCount += 1;
        } else if (spellId === SPELLS.SPRING_BLOSSOMS.id) {
          this.sbCount += 1;
        } else if (spellId === SPELLS.CULTIVATION.id) {
          this.cultCount += 1;
        } else if (spellId === SPELLS.GROVE_TENDING.id) {
          this.groveTendingCount += 1;
        } else if (spellId === SPELLS.TRANQUILITY_HEAL.id) {
          foundTranq = true;
          this.tranqCount += 1;
        }
      });
    });

    if (foundWg) {
      this.wgsExtended += 1;
    }
    if (foundCw) {
      this.cwsExtended += 1;
    }
    if (foundTranq) {
      this.tranqsExtended += 1;
    }
  }

  get totalExtensionHealing() {
    return this.flourishes.reduce((acc, flourish) => acc + flourish.healing + flourish.masteryHealing, 0);
  }

  get averageHealing() {
    return this.flourishCount === 0 ? 0 : this.totalExtensionHealing / this.flourishCount;
  }

  get percentWgsExtended() {
    return this.flourishCount === 0 ? 0 : this.wgsExtended / this.flourishCount;
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
    return (this.cwsExtended / this.flourishCount) || 0;
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
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.FLOURISH_TALENT.id} /> should always aim to extend a <SpellLink id={SPELLS.WILD_GROWTH.id} /></>)
          .icon(SPELLS.FLOURISH_TALENT.icon)
          .actual(i18n._(t('druid.restoration.suggestions.flourish.wildGrowthExtended')`${formatPercentage(this.wgsExtended / this.flourishCount, 0)}% WGs extended.`))
          .recommended(`${formatPercentage(recommended)}% is recommended`));

    if(this.hasCenarionWard) {
      when(this.cenarionWardSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.FLOURISH_TALENT.id} /> should always aim to extend a <SpellLink id={SPELLS.CENARION_WARD_HEAL.id} /></>)
            .icon(SPELLS.FLOURISH_TALENT.icon)
            .actual(i18n._(t('druid.restoration.suggestions.flourish.cenarionWardExtended')`${this.cwsExtended}/${this.flourishCount} CWs extended.`))
            .recommended(`${formatPercentage(recommended)}% is recommended`));
    }
  }

  statistic() {
    const extendPercent = this.owner.getPercentageOfTotalHealingDone(this.totalExtensionHealing);
    const increasedRatePercent = this.owner.getPercentageOfTotalHealingDone(this.increasedRateTotalHealing);
    const totalPercent = this.owner.getPercentageOfTotalHealingDone(this.totalExtensionHealing + this.increasedRateTotalHealing);
    return(
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FLOURISH_TALENT.id} />}
        value={`${formatPercentage(totalPercent)} %`}
        label="Flourish Healing"
        tooltip={(
          <>
            The HoT extension contributed: <strong>{formatPercentage(extendPercent)} %</strong><br />
            The HoT increased tick rate contributed: <strong>{formatPercentage(increasedRatePercent)} %</strong><br />
            <ul>
              {this.wildGrowth !== 0 && <li>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateWildGrowthHealing))}% from Wild Growth</li>}
              {this.rejuvenation !== 0 && <li>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateRejuvenationHealing))}% from Rejuvenation</li>}
              {this.cenarionWard !== 0 && <li>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateCenarionWardHealing))}% from Cenarion Ward</li>}
              {this.lifebloom !== 0 && <li>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateLifebloomHealing))}% from Lifebloom</li>}
              {this.regrowth !== 0 && <li>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateRegrowthHealing))}% from Regrowth</li>}
              {this.cultivation !== 0 && <li>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateCultivationHealing))}% from Cultivation</li>}
              {this.traquility !== 0 && <li>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateTranqHealing))}% from Tranquillity</li>}
              {this.groveTending !== 0 && <li>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.increasedRateGroveTendingHealing))}% from Grove Tending</li>}
            </ul>

            The per Flourish amounts do <em>not</em> include Cultivation due to its refresh mechanic.<br />
            Your {this.flourishCount} Flourish casts extended:
            <ul>
              <li>{this.wgsExtended}/{this.flourishCount} Wild Growth casts ({this.wgCount} HoTs)</li>
              {this.hasCenarionWard && <li>{this.cwsExtended}/{this.flourishCount} Cenarion Wards</li>}
              {this.rejuvCount > 0 && <li>{this.rejuvCount} Rejuvenations</li>}
              {this.regrowthCount > 0 && <li>{this.regrowthCount} Regrowths</li>}
              {this.lbCount > 0 && <li>{this.lbCount} Lifeblooms</li>}
              {this.sbCount > 0 && <li>{this.sbCount} Spring Blossoms</li>}
              {this.cultCount > 0 && <li>{this.cultCount} Cultivations (not counted in HoT count and HoT healing totals)</li>}
              {this.tranqCount > 0 && <li>{this.tranqsExtended}/{this.flourishCount} Tranquillities casts ({this.tranqCount} HoTs)</li>}
              {this.groveTendingCount > 0 && <li>{this.groveTendingCount}/{this.flourishCount} Grove tendings</li>}
            </ul>
            <br />
            The Healing column shows how much additional healing was done by the 8 extra seconds of HoT time. Note that if you Flourished near the end of a fight, numbers might be lower than you expect because extension healing isn't tallied until a HoT falls.
          </>
        )}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast</th>
              <th># of HoTs</th>
              <th>Healing</th>
            </tr>
          </thead>
          <tbody>
            {
              this.flourishes.map((flourish, index) => (
                <tr key={index}>
                  <th scope="row">{ index + 1 }</th>
                  <td>{ flourish.procs }</td>
                  <td>{ formatNumber(flourish.healing + flourish.masteryHealing) }</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </StatisticBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

}

export default Flourish;
