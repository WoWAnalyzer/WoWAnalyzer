import React from 'react';

import HIT_TYPES from 'game/HIT_TYPES';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import StatTracker from 'parser/shared/modules/StatTracker';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

const HEAL_WINDOW_MS = 150;
const bounceReduction = 0.7;
const bounceReductionHighTide = 0.85;

class HighTide extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    critEffectBonus: CritEffectBonus,
  };
  healing = 0;
  chainHealBounce = 0;
  chainHealTimestamp = 0;
  chainHealFeedBounce = 0;
  chainHealFeedTimestamp = 0;

  buffer = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HIGH_TIDE_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CHAIN_HEAL.id) {
      return;
    }

    // resets if its a new chain heal, can't use the cast event for this as its often somewhere in the middle of the healing events
    if (!this.chainHealTimestamp || event.timestamp - this.chainHealTimestamp > HEAL_WINDOW_MS) {
      this.processBuffer();
      this.chainHealTimestamp = event.timestamp;
    }

    const currentMastery = this.statTracker.currentMasteryPercentage;
    let heal = event.amount + (event.absorb || 0) + (event.overheal || 0);
    if (event.hitType === HIT_TYPES.CRIT) {
      const critMult = this.critEffectBonus.getBonus(event);
      heal /= critMult;
    }
    const masteryEffectiveness = Math.max(0, 1 - (event.hitPoints - event.amount) / event.maxHitPoints);
    const baseHealingDone = heal / (1 + currentMastery * masteryEffectiveness);

    this.buffer.push({
      baseHealingDone: baseHealingDone,
      ...event,
    });

  }

  processBuffer() {
    this.buffer.sort((a, b) => parseFloat(b.baseHealingDone) - parseFloat(a.baseHealingDone));

    for (const [index, event] of Object.entries(this.buffer)) {
      const FACTOR_CONTRIBUTED_BY_HT_HIT = (bounceReductionHighTide ** index) / (bounceReduction ** index) - 1;

      if (parseInt(index) === 4) {
        this.healing += event.amount + (event.absorbed || 0);
      } else {
        this.healing += calculateEffectiveHealing(event, FACTOR_CONTRIBUTED_BY_HT_HIT);
      }
    }
    this.buffer = [];
  }

  on_finished() {
    this.processBuffer();
  }

  on_feed_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CHAIN_HEAL.id) {
      return;
    }

    if(!this.chainHealFeedTimestamp || event.timestamp - this.chainHealFeedTimestamp > HEAL_WINDOW_MS) {
      this.chainHealFeedTimestamp = event.timestamp;
      this.chainHealFeedBounce = 0;
    }

    const FACTOR_CONTRIBUTED_BY_HT_HIT = (bounceReductionHighTide ** this.chainHealFeedBounce) / (bounceReduction ** this.chainHealFeedBounce) - 1;

    if(this.chainHealFeedBounce === 4) {
      this.healing += event.feed;
    } else {
      this.healing += event.feed * FACTOR_CONTRIBUTED_BY_HT_HIT;
    }

    this.chainHealFeedBounce++;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.HIGH_TIDE_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }
}

export default HighTide;

