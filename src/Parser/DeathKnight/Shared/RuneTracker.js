import React from 'react';

import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';
import SpellIcon from 'common/SpellIcon';

import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';

import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Abilities from 'Parser/Core/Modules/Abilities';
import Combatants from 'Parser/Core/Modules/Combatants';
import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';

const MAX_RUNES = 6;
const RUNIC_CORRUPTION_INCREASE = 1; //Runic Corruption
const RUNE_MASTER_INCREASE = .4;  //4p21 blood
const RUNE_IDS = [
  SPELLS.RUNE_1.id, //-101
  SPELLS.RUNE_2.id, //-102
  SPELLS.RUNE_3.id, //-103
];

/*
 * Runes are tracked as 3 fake spells with 2 charges to simulate 3 runes charging at the same time.
 * aslong as spells always use the rune pair with the shortest cooldown remaining it should match
 * its in game functionality.
 */
class RuneTracker extends ResourceTracker {
  static dependencies = {
    spellUsable: SpellUsable,
    castEfficiency: CastEfficiency,
    abilities: Abilities,
    combatants: Combatants,
  };

  runesReady = []; //{x, y} points of {time, runeCount} for the chart
  _runesReadySum; //time spent at each rune. _runesReadySum[1] is time spent at one rune available.
  _lastTimestamp; //used to find time since last rune change for the _runesReadySum

  on_initialized() {
    this.resource = RESOURCE_TYPES.RUNES;
    this._lastTimestamp = this.owner.fight.start_time;
    this._runesReadySum = [MAX_RUNES + 1];
    for (let i = 0; i <= MAX_RUNES; i++) {
      this._runesReadySum[i] = 0;
    }
  }
  on_finished() { //add a last event for calculating uptimes and make the chart not end early.
    const runesAvailable = this.runesAvailable;
    this.runesReady.push({ x: this.owner.fightDuration, y: runesAvailable });
    this._runesReadySum[runesAvailable] += this.owner.fight.end_time - this._lastTimestamp;
    this.addPassiveRuneRegeneration();
  }
  on_byPlayer_cast(event) {
    super.on_byPlayer_cast(event);
    if (!event.classResources) {
      return;
    }
    event.classResources
      .filter(resource => resource.type === this.resource.id)
      .forEach(({ amount, cost }) => {
        let runeCost = cost || 0;
        //adjust for resource cost reduction
        if (event.ability.guid === SPELLS.OBLITERATE_CAST.id && this.combatants.selected.hasBuff(SPELLS.OBLITERATION_TALENT.id)) {
          runeCost -= 1;
        }
        if (runeCost <= 0) {
          return;
        }
        for (let i = 0; i < runeCost; i++) { //start rune cooldown
          this.startCooldown();
        }
      });
  }
  on_toPlayer_energize(event) { //add a charge to the rune with the longest remaining cooldown when a rune is refunded.
    super.on_toPlayer_energize(event);
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const amount = event.resourceChange;
    for (let i = 0; i < amount; i++) {
      this.addCharge();
    }
  }
  on_toPlayer_applybuff(event) { //decrease cooldown when a buff that increases rune regeneration rate is applied.
    if (event.ability.guid === SPELLS.RUNIC_CORRUPTION.id) {
      const multiplier = 1 / (1 + RUNIC_CORRUPTION_INCREASE);
      RUNE_IDS.forEach(spellId => {
        this.changeCooldown(spellId, multiplier);
      });
    }
    if (event.ability.guid === SPELLS.RUNE_MASTER.id) {
      const multiplier = 1 / (1 + RUNE_MASTER_INCREASE);
      RUNE_IDS.forEach(spellId => {
        this.changeCooldown(spellId, multiplier);
      });
    }
  }
  on_toPlayer_removebuff(event) { //increase cooldown when a buff that increases rune regeneration rate fades.
    if (event.ability.guid === SPELLS.RUNIC_CORRUPTION.id) {
      const multiplier = 1 + RUNIC_CORRUPTION_INCREASE;
      RUNE_IDS.forEach(spellId => {
        this.changeCooldown(spellId, multiplier);
      });
    }
    if (event.ability.guid === SPELLS.RUNE_MASTER.id) {
      const multiplier = 1 + RUNE_MASTER_INCREASE;
      RUNE_IDS.forEach(spellId => {
        this.changeCooldown(spellId, multiplier);
      });
    }
  }
  on_updatespellusable(event) { //track when a rune comes off cooldown
    const spellId = event.ability.guid;
    if (!RUNE_IDS.includes(spellId)) {
      return;
    }
    let change = 0;
    if (event.trigger === 'endcooldown' || event.trigger === 'restorecharge') { //gained a rune
      change += 1;
    } else if (event.trigger === 'begincooldown' || event.trigger === 'addcooldowncharge') { //spent a rune
      change -= 1;
    } else { //no change
      return;
    }
    //time since last rune change was spent at current runes minus the change.
    this._runesReadySum[this.runesAvailable - change] += event.timestamp - this._lastTimestamp;
    this._lastTimestamp = event.timestamp;
    //Adding two points to the rune chart, one at {time, lastRuneCount} and one at {time, newRuneCount} so the chart does not have diagonal lines.
    this.runesReady.push({ x: this.timeFromStart(event.timestamp), y: this.runesAvailable - change });
    this.runesReady.push({ x: this.timeFromStart(event.timestamp), y: this.runesAvailable });
  }

  addPassiveRuneRegeneration() { //add passive rune regeneration and RC/4p21blood
    let passiveRunesGained = this.runesMaxCasts - this.runesWasted - MAX_RUNES; //subtracts wasted and starting runes
    let passiveRunesWasted = this.runesWasted; //wasted from passive regeneration
    for (const builder in this.buildersObj) { //subtract gained from energize events
      passiveRunesGained -= this.buildersObj[builder].generated;
    }
    //add runic corruption gained (and subtract it from passive regn)
    const runicCorruptionContribution = this.addPassiveAccelerator(SPELLS.RUNIC_CORRUPTION.id, passiveRunesGained, passiveRunesWasted, RUNIC_CORRUPTION_INCREASE);
    passiveRunesGained *= 1 - runicCorruptionContribution;
    passiveRunesWasted *= 1 - runicCorruptionContribution;
    //add Blood 4p21 gained (and subtract it from passive regn)
    const runeMasterContribution = this.addPassiveAccelerator(SPELLS.RUNE_MASTER.id, passiveRunesGained, passiveRunesWasted, RUNE_MASTER_INCREASE);
    passiveRunesGained *= 1 - runeMasterContribution;
    passiveRunesWasted *= 1 - runeMasterContribution;
    //add passive rune regn
    this.initBuilderAbility(SPELLS.RUNE_1.id);
    this.buildersObj[SPELLS.RUNE_1.id].generated += Math.round(passiveRunesGained);
    this.buildersObj[SPELLS.RUNE_1.id].wasted += Math.round(passiveRunesWasted);
  }

  addPassiveAccelerator(spellId, gained, wasted, increase) { //used to add passive rune gain accelerators like Runic Corruption
    //use uptime to get approximate contribution to passive regeneration
    const uptime = this.combatants.selected.getBuffUptime(spellId) / this.owner.fightDuration;
    if (!uptime > 0) {
      return 0;
    }
    this.initBuilderAbility(spellId);
    const contribution = uptime * increase / (1 + increase);
    const acceleratorGained = Math.round(gained * contribution);
    this.buildersObj[spellId].generated += acceleratorGained;
    const acceleratorWasted = Math.round(wasted * contribution);
    this.buildersObj[spellId].wasted += acceleratorWasted;
    return contribution;
  }

  changeCooldown(spellId, multiplier) { //increases or decreases rune cooldown
    if (!this.spellUsable.isOnCooldown(spellId)) {
      return;
    }
    const remainingCooldown = this.spellUsable.cooldownRemaining(spellId);
    const newCooldown = remainingCooldown * multiplier;
    const reduction = remainingCooldown - newCooldown;
    this.spellUsable.reduceCooldown(spellId, reduction);
  }

  addCharge() {
    const runeId = this.longestCooldown;
    if (!this.spellUsable.isOnCooldown(runeId)) {
      return;
    }
    const expectedCooldown = this.abilities.getExpectedCooldownDuration(runeId);
    this.spellUsable.reduceCooldown(runeId, expectedCooldown);
  }

  startCooldown() {
    const runeId = this.shortestCooldown;
    this.spellUsable.beginCooldown(runeId);
  }

  get shortestCooldown() {
    const runeOneCooldown = this.getCooldown(SPELLS.RUNE_1.id) || 0;
    const runeTwoCooldown = this.getCooldown(SPELLS.RUNE_2.id) || 0;
    const runeThreeCooldown = this.getCooldown(SPELLS.RUNE_3.id) || 0;
    if (runeOneCooldown <= runeTwoCooldown && runeOneCooldown <= runeThreeCooldown) {
      return SPELLS.RUNE_1.id;
    }
    else if (runeTwoCooldown <= runeThreeCooldown) {
      return SPELLS.RUNE_2.id;
    } else {
      return SPELLS.RUNE_3.id;
    }
  }

  get longestCooldown() {
    const runeOneCooldown = this.getCooldown(SPELLS.RUNE_1.id) || 0;
    const runeTwoCooldown = this.getCooldown(SPELLS.RUNE_2.id) || 0;
    const runeThreeCooldown = this.getCooldown(SPELLS.RUNE_3.id) || 0;
    if (runeOneCooldown >= runeTwoCooldown && runeOneCooldown >= runeThreeCooldown) {
      return SPELLS.RUNE_1.id;
    }
    else if (runeTwoCooldown >= runeThreeCooldown) {
      return SPELLS.RUNE_2.id;
    } else {
      return SPELLS.RUNE_3.id;
    }
  }

  get runesAvailable() {
    let chargesAvailable = 0;
    RUNE_IDS.forEach(spellId => {
      chargesAvailable += this.spellUsable.chargesAvailable(spellId);
    });
    return chargesAvailable;
  }

  getCooldown(spellId) {
    if (!this.spellUsable.isOnCooldown(spellId)) {
      return null;
    }
    const chargesOnCooldown = 2 - this.spellUsable.chargesAvailable(spellId);
    const cooldownRemaining = this.spellUsable.cooldownRemaining(spellId);
    const fullChargeCooldown = this.abilities.getExpectedCooldownDuration(spellId);
    return (chargesOnCooldown - 1) * fullChargeCooldown + cooldownRemaining;
  }

  get runeEfficiency() {
    const runeCastEfficiencies = [];
    RUNE_IDS.forEach(spellId => {
      runeCastEfficiencies.push(this.castEfficiency.getCastEfficiencyForSpellId(spellId).efficiency);
    });
    return runeCastEfficiencies.reduce((accumulator, currentValue) => accumulator + currentValue) / runeCastEfficiencies.length;
  }

  get runesMaxCasts() {
    const runeMaxCasts = [];
    RUNE_IDS.forEach(spellId => {
      runeMaxCasts.push(this.castEfficiency.getCastEfficiencyForSpellId(spellId).maxCasts);
    });
    const totalCasts = runeMaxCasts.reduce((accumulator, currentValue) => accumulator + currentValue);
    return totalCasts;
  }

  get runesWasted() {
    return this.runesMaxCasts * (1 - this.runeEfficiency);
  }

  get timeSpentAtRuneCount() {
    const timeSpentAtRune = [];
    this._runesReadySum.forEach((time) => {
      timeSpentAtRune.push(time / this.owner.fightDuration);
    });
    return timeSpentAtRune;
  }

  timeFromStart(timestamp) {
    return (timestamp - this.owner.fight.start_time) / 1000;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.runeEfficiency,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.runeEfficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You overcapped {formatPercentage(actual)}% of your runes. Try to always have atleast 3 runes on cooldown.</Wrapper>)
        .icon(SPELLS.RUNE_1.icon)
        .actual(`${formatPercentage(actual)}% runes overcapped`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    const timeSpentAtRuneCount = this.timeSpentAtRuneCount;
    const badThreshold = 4;
    return (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.RUNE_1.id} noLink={true} />}
        value={`${formatPercentage(1 - this.runeEfficiency)} %`}
        label="Runes overcapped"
        tooltip={`
          Number of runes wasted: ${formatNumber(this.runesWasted)} <br>
          These numbers only include runes wasted from passive regeneration. <br>
          The table below shows the time spent at any given number of runes available.
        `}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Runes</th>
              <th>Time (s)</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            { //split into good and bad number of runes available
              this._runesReadySum.filter((value, index) => index < badThreshold).map((value, index) => (
                <tr>
                  <th>{index}</th>
                  <td>{formatDuration(this._runesReadySum[index] / 1000)}</td>
                  <td>{formatPercentage(timeSpentAtRuneCount[index])}%</td>
                </tr>
              ))
            }
            {
              this._runesReadySum.filter((value, index) => index >= badThreshold).map((value, index) => (
                <tr>
                  <th style={{ color: 'red' }}>{index + badThreshold}</th>
                  <td>{formatDuration(this._runesReadySum[index + badThreshold] / 1000)}</td>
                  <td>{formatPercentage(timeSpentAtRuneCount[index + badThreshold])}%</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);

}

export default RuneTracker;
