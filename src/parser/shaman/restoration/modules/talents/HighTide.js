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
const debug = false;

/**
 * High Tide:
 * Every 40000 mana you spend brings a High Tide, making your next 2 Chain Heals heal for an additional 20% and not reduce with each jump.
 */

/**
 * Logs for testing High Tide buff usage:
 * Double stack log: https://www.warcraftlogs.com/reports/Qb91XvyqtNjaHRPr#fight=21&type=auras&source=11&pins=0%24Separate%24%23244F4B%24healing%240%240.0.0.Any%24137004809.0.0.Shaman%24true%240.0.0.Any%24false%241064&ability=288675
 * Buff applied pre-pull: https://www.warcraftlogs.com/reports/R4JncHyajt8VQr9h#fight=48&type=auras&source=14&ability=288675
 */

class HighTide extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    critEffectBonus: CritEffectBonus,
  };
  healing = 0;
  chainHealTimestamp = 0;
  buffer = [];

  // high tide efficiency trackers
  usedHighTides = 0;
  unusedHighTides = 0;
  currentHighTideBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HIGH_TIDE_TALENT.id);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HEAL), this.chainHeal);
    this.addEventListener(Events.fightend, this.onFightEnd);

    // these are for tracking high tide efficiency
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HEAL), this.onChainHealCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HIGH_TIDE_BUFF), this.onHighTideBuff);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.HIGH_TIDE_BUFF), this.onHighTideBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HIGH_TIDE_BUFF), this.onHighTideRemoveBuff);
  }

  // in the event of a High Tide buff, if a buff still exists adds it to unused then resets buff counter to 2
  onHighTideBuff(event) {
    this.unusedHighTides += this.currentHighTideBuff;
    this.currentHighTideBuff = 2;
  }

  // in the event of a High Tide remove buff, adds any existing buff to unused and sets buff counter to 0
  onHighTideRemoveBuff(event) {
    this.unusedHighTides += this.currentHighTideBuff; //if there were leftovers when buff expires
    this.currentHighTideBuff = 0;
  }

  // on a chain heal cast and buff counter is greater than 0, adds one to used counter 
  // and reduces buff counter by one.
  onChainHealCast(event) {
    if (this.currentHighTideBuff > 0) {
      this.usedHighTides++;
      this.currentHighTideBuff -= 1;
    }
  }

  chainHeal(event) {
    const hasHighTide = this.selectedCombatant.hasBuff(SPELLS.HIGH_TIDE_BUFF.id, null, 50, 20);
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

  onFightEnd() {
    this.processBuffer();
  }

  processBuffer() {
    this.buffer.sort((a, b) => parseFloat(b.baseHealingDone) - parseFloat(a.baseHealingDone));

    for (const [index, event] of Object.entries(this.buffer)) {
      // 20%, 71%, 145%, 250% increase per hit over not having High Tide
      const FACTOR_CONTRIBUTED_BY_HT_HIT = (SPELLS.HIGH_TIDE_BUFF.coefficient) / (SPELLS.CHAIN_HEAL.coefficient * bounceReduction ** index) - 1;

      this.healing += calculateEffectiveHealing(event, FACTOR_CONTRIBUTED_BY_HT_HIT);
      debug && this.log(`HT: ${this.owner.formatTimestamp(event.timestamp)} ${event.amount + (event.overheal || 0)} - ${FACTOR_CONTRIBUTED_BY_HT_HIT} - ${calculateEffectiveHealing(event, FACTOR_CONTRIBUTED_BY_HT_HIT)}`);
    }
    this.buffer = [];
  }

  subStatistic() {
    const highTideToolTip = `${this.usedHighTides} High Tide buff stacks used out of ${(this.usedHighTides + this.unusedHighTides + this.currentHighTideBuff)}.`;

    return (
      <div>
        <StatisticListBoxItem
          title={<SpellLink id={SPELLS.HIGH_TIDE_TALENT.id} />}
          value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
          valueTooltip={highTideToolTip}
        />
      </div>
    );
  }
}

export default HighTide;

