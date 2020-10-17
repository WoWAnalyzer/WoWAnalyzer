import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../constants';
import Rejuvenation from '../core/Rejuvenation';
import Events from 'parser/core/Events';

const ALL_BOOST = 0.15;
const ALL_MULT = 1.15;
const REJUV_BOOST = 0.50;
const REJUV_MANA_SAVED = 0.30;
const REJUV_MANA_COST = SPELLS.REJUVENATION.manaCost;
const WG_INCREASE = (8 / 6) - 1;
const TOL_DURATION = 30000;

// have to be careful about applying stacking boosts so we don't double count. Arbitrarily considering all boost to be applied "first"
// for example, lets say a rejuv tick during ToL heals for 1000 base, but is boosted by 1.15 * 1.5 => 1725... a total of 725 raw boost
// if we count each as a seperate boost, we get 1.15 => 225 boost, 1.5 => 575, total of 800 ... the overlapping boost was double counted
// we correct for this by dividing out the all boost before calcing either the rejuv boost or the wg increase

/*
 * This module handles 'Incarnation: Tree of Life' talent.
 *
 * Incarnation: Tree of Life -
 * Shapeshift into the Tree of Life, increasing healing done by 15%, increasing armor by 120%, and granting protection from Polymorph effects.  Functionality of Rejuvenation, Wild Growth, Regrowth, and Entangling Roots is enhanced.
 *
 * Tree of Life bonuses:
 *  - ALL: +15% healing
 *  - Rejuv: +50% healing and -30% mana
 *  - Regrowth: instant
 *  - Wild Growth: +2 targets
 */
class TreeOfLife extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    abilityTracker: AbilityTracker,
    rejuvenation: Rejuvenation,
  };

  lastTolCast = null;

  lastTolApply = null;
  completedTolUptime = 0;

  wgCasts = 0;

  hardcast = {
    allBoostHealing: 0,
    rejuvBoostHealing: 0,
    rejuvManaSaved: 0,
    extraWgHealing: 0,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_HEALING_INCREASES), this.onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell([SPELLS.INCARNATION_TREE_OF_LIFE_TALENT, SPELLS.REJUVENATION, SPELLS.WILD_GROWTH]), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INCARNATION_TOL_ALLOWED), this.onApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INCARNATION_TOL_ALLOWED), this.onRemoveBuff);
  }

  // gets the appropriate accumulator for tallying this event
  // if ToL buff isn't active, returns null,
  // if ToL buff is due to hardcast, returns the hardcast accumulator,
  _getAccumulator(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id)) {
      return null;
    } else if (this.lastTolCast && this.lastTolCast + TOL_DURATION > event.timestamp) {
      return this.hardcast;
    } else {
      return null;
    }
  }

  onHeal(event) {
    const spellId = event.ability.guid;

    const accumulator = this._getAccumulator(event);
    if (!accumulator) {
      return;
    }

    accumulator.allBoostHealing += calculateEffectiveHealing(event, ALL_BOOST);

    if (spellId === SPELLS.REJUVENATION.id || spellId === SPELLS.REJUVENATION_GERMINATION.id) {
      accumulator.rejuvBoostHealing += (calculateEffectiveHealing(event, REJUV_BOOST) / ALL_MULT);
    } else if (spellId === SPELLS.WILD_GROWTH.id) {
      accumulator.extraWgHealing += (calculateEffectiveHealing(event, WG_INCREASE) / ALL_MULT);
    }
  }

  onCast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id) {
      this.lastTolCast = event.timestamp;
    } else if (spellId === SPELLS.REJUVENATION.id && !this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id)) {
      const accumulator = this._getAccumulator(event);
      if (!accumulator) {
        return;
      }
      accumulator.rejuvManaSaved += REJUV_MANA_SAVED;
    } else if (spellId === SPELLS.WILD_GROWTH.id) {
      this.wgCasts += 1;
    }
  }

  onApplyBuff(event) {
    this.lastTolApply = event.timestamp;
  }

  onRemoveBuff(event) {
    const buffUptime = event.timestamp - this.lastTolApply;

    if (this.lastTolCast) {
      this.completedTolUptime += Math.min(TOL_DURATION, buffUptime);
    }

    this.lastTolCast = null;
    this.lastTolApply = null;
  }

  get hardcastUptime() {
    const currentUptime = !(this.lastTolCast) ? 0 : Math.min(TOL_DURATION, this.owner.currentTimestamp - this.lastTolCast);
    return currentUptime + this.completedTolUptime;
  }
  get hardcastUptimePercent() {
    return this.hardcastUptime / this.owner.fightDuration;
  }

  _getManaSavedHealing(accumulator) {
    return accumulator.rejuvManaSaved * this.rejuvenation.avgRejuvHealing;
  }

  _getManaSaved(accumulator) {
    return accumulator.rejuvManaSaved * REJUV_MANA_COST;
  }

  _getTotalHealing(accumulator) {
    return accumulator.allBoostHealing + accumulator.rejuvBoostHealing + accumulator.extraWgHealing + this._getManaSavedHealing(accumulator);
  }

  get suggestionThresholds() {
    return {
      actual: this.owner.getPercentageOfTotalHealingDone(this._getTotalHealing(this.hardcast)),
      isLessThan: {
        minor: 0.06,
        average: 0.045,
        major: 0.025,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id} /> is not providing you much throughput. You may want to plan your CD usage better or pick another talent.</>)
          .icon(SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.icon)
          .actual(i18n._(t('druid.restoration.suggestions.treeOfLife.efficiency')`${formatPercentage(actual)}% healing`))
          .recommended(`>${formatPercentage(recommended, 0)}% is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.INCARNATION_TREE_OF_LIFE_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this._getTotalHealing(this.hardcast)))} %`}
        label="Tree of Life Healing"
        tooltip={(
          <>
            The Tree of Life buff was active for <strong>{(this.hardcastUptime / 1000).toFixed(0)}s</strong>, or <strong>{formatPercentage(this.hardcastUptimePercent, 1)}%</strong> of the encounter. The displayed healing number is the sum of several benefits, listed below:
            <ul>
              <li>Overall Increased Healing: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.hardcast.allBoostHealing))}%</strong></li>
              <li>Rejuv Increased Healing: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.hardcast.rejuvBoostHealing))}%</strong></li>
              <li>Rejuv Mana Saved: <strong>{formatNumber(this._getManaSaved(this.hardcast))}</strong> (assuming mana used to fill with Rejuvs: <strong>≈{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this._getManaSavedHealing(this.hardcast)))}%</strong> healing)</li>
              <li>Increased Wild Growths: <strong>{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.hardcast.extraWgHealing))}%</strong></li>
            </ul>
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default TreeOfLife;
