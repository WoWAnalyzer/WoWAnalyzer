import React from 'react';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import DamageTaken from './DamageTaken';

// Brew-Stache is a buff that adds 10% dodge after consuming a brew
const BREW_STACHE_DODGE = 0.1;

// coefficients to calculate dodge chance from agility
//
// see here for data: 
// https://docs.google.com/spreadsheets/d/1sgFT4lGgBPiqkGjvpeReG2QKJv-jhzZdKIako37bURw/edit?usp=sharing 
const MONK_DODGE_COEFFS = {
  base_dodge: 0.03,
  base_agi: 9028,
  // solved via linear regression from data
  tooltip: {
    slope: 0.000007631531252,
    intercept: 0.00001700268385,
  },
  // names of individual coefficients are taken from ancient lore, err,
  // formulae
  diminished: {
    k: 1.064161593,
    C_d: 0.5558721267,
  },
};

function _clampProb(prob) {
  if(prob > 1.0) {
    return 1.0;
  } else if(prob < 0.0) {
    return 0.0;
  } else {
    return prob;
  }
}

/**
 * This class represents the Markov Chain with which the Mastery stacks
 * are modeled. The transition probabilities are defined by two
 * potential operations:
 *
 * 1. Guaranteed Addition: from using an ability that generates a stack
 * 100% of the time (e.g. BoS, BoF). The probability of having i stacks
 * afterward is equal to the probability of having i-1 stacks before
 * (the probability of having 0 stacks afterward is 0).
 *
 * 2. Attack: The probability of having i > 0 stacks afterward is equal to
 * the probability of being hit with i - 1 stacks. The probability of
 * having 0 stacks afterward is the sum of the probabilities of dodging
 * with each number of stacks. Note that there is a natural cap on the
 * number of stacks you can reach, since after that point every hit will
 * be a dodge.
 *
 * The expected number of stacks you have is just the sum of the indices
 * weighted by the values.
 */
class StackMarkovChain {
  _stackProbs = [1.0];

  _assertSum() {
    const sum = this._stackProbs.reduce((sum, p) => p + sum, 0);
    if (Math.abs(sum - 1.0) > 1e-6) {
      const err = new Error("probabilities do not sum to 1 in StackMarkovChain");
      err.data = {
        sum: sum,
        probs: this._stackProbs,
      };
      console.log(err.data);

      throw err;
    }
  }

  // add a stack with guaranteed probability
  guaranteeStack() {
    this._stackProbs.unshift(0.0);
    this._assertSum();
  }

  processAttack(dodgeProb, masteryValue) {
    this._stackProbs.push(0);
    const n = this._stackProbs.length - 1;

    // probability of ending at 0 stacks. initial 
    let zeroProb = 0;
    // didn't dodge, gain a stack
    for(let stacks = n-1; stacks >= 0; stacks--) {
      const prob = _clampProb(dodgeProb + masteryValue * stacks);
      zeroProb += prob * this._stackProbs[stacks]; // dodge -> go to 0
      const hitProb = 1 - prob;
      this._stackProbs[stacks+1] = hitProb * this._stackProbs[stacks]; // hit -> go to stacks + 1
    }
    // did dodge, reset stacks
    this._stackProbs[0] = zeroProb;
    this._assertSum();
  }

  get expected() {
    return this._stackProbs.reduce((sum, prob, index) => sum + prob * index, 0);
  }
}

/**
 * Estimate the expected value of mastery on this fight. The *actual*
 * estimated value is subject to greater variance.
 * On the other hand, the expected value averages over all
 * possible outcomes and gives a better sense of how valuable mastery is
 * if you were to do this fight again. This values more stable over
 * repeated attempts or kills and reflects the value of mastery (and the
 * execution of the rotation) more closely than how well-favored you
 * were on this particular attempt.
 *
 * We calculate the expected value by applying the Markov Chain above to
 * the timeline to calculate the expected number of stacks at each
 * dodgeable event. This is then combined with information about the
 * expected damage of each dodged hit (dodge events have amount: 0,
 * absorbed: 0, etc.) to provide a best-guess estimate of the damage
 * you'll mitigate on average. The actual estimate (shown in the
 * tooltip) may be over or under this, but is unlikely to be far from
 * it.
 *
 * This madness was authored by emallson. If you need further explanation of
 * the theory behind it, find me on discord.
 */
class MasteryValue extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    dmg: DamageTaken,
    stats: StatTracker,
  };

  _dodgeableSpells = {};
  _timeline = [];
  _hitCounts = {};
  _dodgeCounts = {};

  baseDodge(agility) {
    const tooltip = MONK_DODGE_COEFFS.tooltip.intercept + MONK_DODGE_COEFFS.tooltip.slope * (agility - MONK_DODGE_COEFFS.base_agi);
    return (tooltip * MONK_DODGE_COEFFS.diminished.C_d) / (tooltip + MONK_DODGE_COEFFS.diminished.k * MONK_DODGE_COEFFS.diminished.C_d) + MONK_DODGE_COEFFS.base_dodge;
  }

  dodgePenalty(_source) {
    return 0.045; // 1.5% per level, bosses are three levels over players. not sure how to get trash levels yet -- may not matter
  }

  // returns the current chance to dodge a damage event assuming the
  // event is dodgeable
  dodgeChance(masteryStacks, masteryRating, agility, sourceID, timestamp = null) {
    const brewStacheDodge = this.combatants.selected.hasBuff(SPELLS.BREW_STACHE.id, timestamp) ? BREW_STACHE_DODGE : 0;
    const masteryPercentage = this.stats.masteryPercentage(masteryRating, true);
    return _clampProb(masteryPercentage * masteryStacks + this.baseDodge(agility) + brewStacheDodge - this.dodgePenalty(sourceID));
  }


  on_byPlayer_cast(event) {
    if(this._appliesStack(event)) {
      this._timeline.push(event);
    }
  }

  on_toPlayer_damage(event) {
    event._masteryRating = this.stats.currentMasteryRating;
    event._agility = this.stats.currentAgilityRating;
    if(event.hitType === HIT_TYPES.DODGE) {
      this._addDodge(event);
    } else {
      this._addHit(event);
    }
  }

  _addDodge(event) {
    const spellId = event.ability.guid;
    this._dodgeableSpells[spellId] = true;
    if(!(spellId in this._dodgeCounts)) {
      this._dodgeCounts[spellId] = 0;
    }
    this._dodgeCounts[spellId] += 1;
    this._timeline.push(event);
  }

  _addHit(event) {
    const spellId = event.ability.guid;
    if(!(spellId in this._hitCounts)) {
      this._hitCounts[spellId] = 0;
    }
    this._hitCounts[spellId] += 1;
    this._timeline.push(event);
  }

  // returns true of the event represents a cast that applies a stack of
  // mastery
  //
  // neither blackout combo + purify nor t21 are supported yet
  _appliesStack(event) {
    return event.ability.guid === SPELLS.BLACKOUT_STRIKE.id;
  }

  meanHitByAbility(spellId) {
    if(spellId in this._hitCounts) {
      return (this.dmg.byAbility(spellId).effective + this.dmg.staggeredByAbility(spellId)) / this._hitCounts[spellId];
    }
    return 0;
  }

  // events that either (a) add a stack or (b) can be dodged according
  // to the data we have
  get relevantTimeline() {
    return this._timeline.filter(event => event.type === "cast" || this._dodgeableSpells[event.ability.guid]);
  }

  get _expectedValues() {
    // expected damage mitigated according to the markov chain
    let expectedDamageMitigated = 0;
    let noMasteryExpectedDamageMitigated = 0;
    // estimate of the damage that was actually dodged in this log
    let estimatedDamageMitigated = 0;
    // average dodge % across each event that could be dodged
    let meanExpectedDodge = 0;
    let dodgeableEvents = 0;

    const stacks = new StackMarkovChain(); // mutating a const object irks me to no end
    const noMasteryStacks = new StackMarkovChain();

    // timeline replay is expensive, compute several things here and
    // provide individual getters for each of the values
    this.relevantTimeline.forEach(event => {
      if(event.type === "cast") {
        stacks.guaranteeStack();
        noMasteryStacks.guaranteeStack();
      } else if(event.type === "damage") {
        const noMasteryDodgeChance = this.dodgeChance(noMasteryStacks.expected, 0, event._agility, event.sourceID, event.timestamp);
        const expectedDodgeChance = this.dodgeChance(stacks.expected, event._masteryRating, event._agility, event.sourceID, event.timestamp);
        const baseDodgeChance = this.dodgeChance(0, 0, event._agility, event.sourceID, event.timestamp);

        const damage = (event.amount + event.absorbed) || this.meanHitByAbility(event.ability.guid);
        expectedDamageMitigated += expectedDodgeChance * damage;
        noMasteryExpectedDamageMitigated += noMasteryDodgeChance * damage;
        estimatedDamageMitigated += (event.hitType === HIT_TYPES.DODGE) * damage;
        meanExpectedDodge += expectedDodgeChance;
        dodgeableEvents += 1;

        stacks.processAttack(baseDodgeChance, this.stats.masteryPercentage(event._masteryRating, true));
        noMasteryStacks.processAttack(baseDodgeChance, this.stats.masteryPercentage(0, true));
      }
    });

    meanExpectedDodge /= dodgeableEvents;

    return {
      expectedDamageMitigated,
      estimatedDamageMitigated,
      meanExpectedDodge,
      noMasteryExpectedDamageMitigated,
    };
  }

  get expectedMitigation() {
    return this._expectedValues.expectedDamageMitigated;
  }
  
  get expectedMeanDodge() {
    return this._expectedValues.meanExpectedDodge;
  }

  get actualDodgeRate() {
    const totalHits = Object.keys(this._dodgeableSpells).reduce((sum, spellId) => sum + (this._hitCounts[spellId] || 0), 0);
    const totalDodges = Object.keys(this._dodgeableSpells).reduce((sum, spellId) => sum + this._dodgeCounts[spellId], 0);
    return totalDodges / (totalHits + totalDodges);
  }

  get estimatedActualMitigation() {
    return this._expectedValues.estimatedDamageMitigated;
  }

  get averageMasteryRating() {
    return this.relevantTimeline.reduce((sum, event) => {
      if(event.type === "damage") {
        return event._masteryRating + sum;
      } else {
        return sum;
      }
    }, 0) / this.relevantTimeline.filter(event => event.type === "damage").length;
  }

  get noMasteryExpectedMitigation() {
    return this._expectedValues.noMasteryExpectedDamageMitigated;
  }

  get expectedMitigationPerSecond() {
    return this.expectedMitigation / this.owner.fightDuration * 1000;
  }

  get noMasteryExpectedMitigationPerSecond () {
    return this.noMasteryExpectedMitigation / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MASTERY_ELUSIVE_BRAWLER.id} />}
        value={`${formatNumber(this.expectedMitigationPerSecond - this.noMasteryExpectedMitigationPerSecond)} DTPS`}
        label="Expected Mitigation by Mastery"
        tooltip={`On average, you would dodge about <b>${formatNumber(this.expectedMitigation)}</b> damage on this fight. This value was increased by about <b>${formatNumber(this.expectedMitigation - this.noMasteryExpectedMitigation)}</b> due to Mastery. You had an average expected dodge chance of <b>${formatPercentage(this.expectedMeanDodge)}%</b> and actually dodged about <b>${formatNumber(this.estimatedActualMitigation)}</b> damage with an overall rate of <b>${formatPercentage(this.actualDodgeRate)}%</b>. This amounts to an expected reduction of <b>${formatNumber((this.expectedMitigationPerSecond - this.noMasteryExpectedMitigationPerSecond) / this.averageMasteryRating)} DTPS per 1 Mastery</b> <em>on this fight</em>.<br/><br/>

          <em>Technical Information:</em><br/>
          <b>Estimated Actual Damage</b> is calculated by calculating the average damage per hit of an ability, then multiplying that by the number of times you dodged each ability.<br/>
          <b>Expected</b> values are calculated by computing the expected number of mastery stacks each time you <em>could</em> dodge an ability.<br/>
          An ability is considered <b>dodgeable</b> if you dodged it at least once.<br/>
          Blackout Combo with Purifying Brew and Tier 21 are not supported (yet).`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default MasteryValue;
