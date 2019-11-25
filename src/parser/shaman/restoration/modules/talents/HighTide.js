import React from 'react';

import HIT_TYPES from 'game/HIT_TYPES';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import StatTracker from 'parser/shared/modules/StatTracker';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

const HEAL_WINDOW_MS = 150;
const bounceReduction = 0.7;

/**
 * High Tide:
 * Every 40000 mana you spend brings a High Tide, making your next 2 Chain Heals heal for an additional 20% and not reduce with each jump.
 */

class HighTide extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    critEffectBonus: CritEffectBonus,
  };
  healing = 0;
  chainHealTimestamp = 0;

  buffer = [];

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HIGH_TIDE_TALENT.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HEAL), this.chainHeal);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  chainHeal(event) {
    const hasHighTide = this.selectedCombatant.hasBuff(SPELLS.HIGH_TIDE_BUFF.id);
    if (!hasHighTide) {
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
     * 1. The healing events are backwards [4,3,2,1]
     * 2. If the Shaman heals himself, his healing event is always first [3,4,2,1] (3 = Shaman)
     * 3. If 2. happens, the heal on the shaman is also happening before the cast event, which the lines above already deal with.
     * 
     * Calculating out High Tide requires us to know the exact jump order, as High Tide affects each jump differently.
     * https://ancestralguidance.com/hidden-spell-mechanics/
     * The solution is to reorder the events into the correct hit order, which could be done since each consecutive heal is weaker
     * than the one beforehand (by 30%), except, you have the Shaman mastery which will result in random healing numbers
     * as each hit has a different mastery effectiveness - the higher the Shamans mastery, the more rapidly different the numbers end up.
     * With traits like https://www.wowhead.com/spell=277942/ancestral-resonance existing, shamans mastery can randomly double or triple mid combat.
     * 
     * So we take 1 cast of chain heal at a time (4 hits maximum), calculate out crits and the mastery bonus, reorder them according to the new values
     * (High healing to Low healing or [4,3,2,1] to [1,2,3,4]) and get the High Tide contribution by comparing the original heal values against
     * what a non-High Tide Chain Heal would have done each bounce.
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
      // 20%, 71%, 145%, 250% increase per hit over not having High Tide
      const FACTOR_CONTRIBUTED_BY_HT_HIT = (SPELLS.HIGH_TIDE_BUFF.coefficient) / (SPELLS.CHAIN_HEAL.coefficient * bounceReduction ** index) - 1;

      this.healing += calculateEffectiveHealing(event, FACTOR_CONTRIBUTED_BY_HT_HIT);
    }
    this.buffer = [];
  }

  onFightEnd() {
    this.processBuffer();
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

