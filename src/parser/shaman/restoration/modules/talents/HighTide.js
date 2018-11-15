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

/**
 * High Tide:
 * Chain Heal bounces to 1 additional target, and its falloff with each bounce is reduced by half.
 */

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

    // Detects new chain heal casts, can't use the cast event for this as its often somewhere in between its healing events
    if (!this.chainHealTimestamp || event.timestamp - this.chainHealTimestamp > HEAL_WINDOW_MS) {
      this.processBuffer();
      this.chainHealTimestamp = event.timestamp;
    }

    /**
     * Due to how Chain Heal interacts with the combatlog, we have to take a lot of extra steps here.
     * Issues:
     * 1. The healing events are backwards [5,4,3,2,1]
     * 2. If the Shaman heals himself, his healing event is always first [3,5,4,2,1] (3 = Shaman)
     * 3. If 2. happens, the heal on the shaman is also happening before the cast event, which the lines above already deal with.
     * 
     * Calculating out High Tide requires us to know the exact jump order, as High Tide affects each jump differently, you gain
     * 0% heal on the initial hit but 100% healing on the last hit, compared to not having High Tide.
     * https://ancestralguidance.com/hidden-spell-mechanics/
     * The solution is to reorder the events into the correct hit order, which could be done since each consecutive heal is weaker
     * than the one beforehand (by 15%), except, you have the Shaman mastery which will result in random healing numbers
     * as each hit has a different mastery effectiveness - the higher the Shamans mastery, the more rapidly different the numbers end up.
     * With traits like https://www.wowhead.com/spell=277942/ancestral-resonance existing, shamans mastery can randomly double or triple mid combat.
     * 
     * So we take 1 cast of chain heal at a time (5 hits maximum), calculate out crits and the mastery bonus, reorder them according to the new values
     * (High healing to Low healing or [5,4,3,2,1] to [1,2,3,4,5]) and get the High Tide contribution by comparing the original heal valuesa gainst
     * what a non-High Tide Chain Heal would have done each bounce (double the fall-off per hit and no 5th hit).
     * 
     * Things that are able to break the sorting: Deluge (Pls don't take it) as its undetectable, random player-based heal increases
     * (possibly encounter mechanics) if not accounted for.
     */
    let heal = event.amount + (event.absorbed || 0) + (event.overheal || 0);
    if (event.hitType === HIT_TYPES.CRIT) {
      const critMult = this.critEffectBonus.getBonus(event);
      heal /= critMult;
    }
    const currentMastery = this.statTracker.currentMasteryPercentage;
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
      // 0%, 21%, 47%, 79%, (100%) increase per hit over not having High Tide, assuming no overheal thats a 46% total increase
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

