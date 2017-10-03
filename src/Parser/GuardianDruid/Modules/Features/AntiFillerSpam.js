import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';

import StatisticBox from 'Main/StatisticBox';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import Haste from 'Parser/Core/Modules/Haste';

import ActiveTargets from './ActiveTargets';

const debug = false;

// The  amount of time after a proc has occurred before casting a filler is no longer acceptable
const REACTION_TIME_THRESHOLD = 500;


const GCD_SPELLS = {
  // Rotational spells
  [SPELLS.MANGLE_BEAR.id]: {
    isFiller: false,
    baseCD: 6,
    hastedCD: true,
    // Specifies a way that the spell can be available outside of its normal CD
    proc: ({ timestamp }, combatant) => {
      const hasGoreProc = combatant.hasBuff(SPELLS.GORE_BEAR.id, timestamp);
      return hasGoreProc;
    },
  },
  [SPELLS.THRASH_BEAR.id]: {
    isFiller: false,
    baseCD: 6,
    hastedCD: true,
    proc: ({ timestamp }, combatant) => {
      const isIncarnation = combatant.hasBuff(SPELLS.INCARNATION_OF_URSOC.id, timestamp);
      return isIncarnation;
    },
  },
  [SPELLS.PULVERIZE_TALENT.id]: {
    isFiller: false,
    baseCD: null,
    condition: ({ timestamp, targetID }, combatant, targets) => {
      const pulverizeTalented = combatant.lv100Talent === SPELLS.PULVERIZE_TALENT.id;

      // TODO: make this stacks deficit
      // const targetHasThrashStacks = targets[targetID] && targets[targetID].hasBuff(SPELLS.THRASH_BEAR_DOT.id, timestamp).stacks >= 2;
      const target = targets.find(t => t.id === targetID);
      if (!target) {
        return false;
      }
      const targetHasThrashStacks = target.hasBuff(SPELLS.THRASH_BEAR_DOT.id, timestamp).stacks >= 2;
      return pulverizeTalented && targetHasThrashStacks;
    },
  },

  // "Filler" spells
  [SPELLS.MOONFIRE.id]: {
    isFiller: ({ timestamp, targetID }, combatant, targets, lastCast) => {
      if (combatant.lv75Talent === SPELLS.GALACTIC_GUARDIAN_TALENT.id) {
        return (
          !combatant.hasBuff(SPELLS.GALACTIC_GUARDIAN.id, timestamp - REACTION_TIME_THRESHOLD) && // Account for reaction time
          targets.every(target => target.hasBuff(SPELLS.MOONFIRE_BEAR.id, timestamp - 1)) // Moonfire was already ticking
        );
      }

      return (
        targets.every(target => target.hasBuff(SPELLS.MOONFIRE_BEAR.id, timestamp - 1)) // Moonfire was already ticking
      );

    },
    baseCD: null,
  },
  [SPELLS.BEAR_SWIPE.id]: {
    isFiller: (event, combatant, targets) => targets.length > 3,
    // isFiller: (event, combatant, targets, lastCast) => targets > ,
    baseCD: null,
  },

  // Utility/other spells
  [SPELLS.STAMPEDING_ROAR_BEAR.id]: { isFiller: false, isUtility: true },
  [SPELLS.BEAR_FORM.id]: { isFiller: false, isUtility: true },
  [SPELLS.CAT_FORM.id]: { isFiller: false, isUtility: true },
  [SPELLS.TRAVEL_FORM.id]: { isFiller: false, isUtility: true },
  [SPELLS.MOONKIN_FORM.id]: { isFiller: false, isUtility: true },
  [SPELLS.REBIRTH.id]: { isFiller: false, isUtility: true },
};

class AntiFillerSpam extends Module {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
    haste: Haste,
    activeTargets: ActiveTargets,
  };

  _hasteLog = [];
  abilityLastCasts = {};
  _totalGCDSpells = 0;
  _totalFillerSpells = 0;
  _unnecessaryFillerSpells = 0;

  on_initialized() {
    const baseHaste = this.combatants.selected.hastePercentage;
    this.recordHasteChange(baseHaste, this.owner.fight.start_time);
  }

  on_changehaste(event) {
    this.recordHasteChange(event.newHaste, this.owner.currentTimestamp);
  }

  on_byPlayer_cast(event) {
    const spellID = event.ability.guid;
    const spell = GCD_SPELLS[spellID];
    if (spell) {
      this._totalGCDSpells += 1;
      const timestamp = event.timestamp;
      const spellLastCast = this.abilityLastCasts[spellID] || -Infinity;
      const targets = this.activeTargets.getActiveTargets(event.timestamp).map(enemyID => this.enemies.enemies[enemyID]).filter(enemy => !!enemy);
      console.log('[enemies]', this.enemies.enemies);
      console.log('[targetIDs]', this.activeTargets.getActiveTargets(event.timestamp));
      console.log('[targets]', targets);
      const combatant = this.combatants.selected;
      this.abilityLastCasts[spellID] = timestamp;

      const isFillerEval = (typeof spell.isFiller === 'function') ? spell.isFiller(event, combatant, targets, spellLastCast) : spell.isFiller;
      if (!isFillerEval) {
        return;
      }

      this._totalFillerSpells += 1;

      debug && console.group(`[FILLER SPELL] - ${SPELLS[spellID].name}`, event);
      const availableSpells = [];
      Object.keys(GCD_SPELLS).forEach((gcdSpellID) => {
        // We have to cast to string here because Object keys are always strings
        if (`${spellID}` === gcdSpellID) {
          return;
        }

        const { isFiller, baseCD, hastedCD, condition, proc, isUtility } = GCD_SPELLS[gcdSpellID];
        const lastCast = this.abilityLastCasts[gcdSpellID] || -Infinity;
        const isFillerEval = (typeof isFiller === 'function') ? isFiller(event, combatant, targets, lastCast) : isFiller;
        if (isFillerEval || isUtility) {
          return;
        }

        let isOffCooldown = true;
        if (baseCD !== null) {
          if (hastedCD) {
            debug && console.log(`[${SPELLS[gcdSpellID].name} ${gcdSpellID}] - lastCast: ${lastCast} - currentTime: ${timestamp}`);
            isOffCooldown = this.isHastedAbilityOffCooldown(lastCast, timestamp, baseCD);
          } else {
            isOffCooldown = timestamp - lastCast > baseCD;
          }
        }

        const hasProc = proc && ((typeof proc === 'function') ? proc(event, combatant, targets, lastCast) : proc);
        const meetsCondition = condition ? ((typeof condition === 'function') ? condition(event, combatant, targets, lastCast) : condition) : true;


        if ((isOffCooldown || hasProc) && meetsCondition) {
          debug && console.warn(`[${SPELLS[gcdSpellID].name} ${gcdSpellID}] - isOffCD: ${isOffCooldown} - proc?: ${hasProc} - condition?: ${meetsCondition}`);
          availableSpells.push(gcdSpellID);
        }
      });
      debug && console.groupEnd();
      if (availableSpells.length > 0) {
        this._unnecessaryFillerSpells += 1;
      }

    }
  }

  on_finished() {
    debug && console.log('[haste log]', this._hasteLog);
    debug && console.log(`[filler spam] ${this._unnecessaryFillerSpells} / ${this._totalGCDSpells} (${formatPercentage(this.fillerSpamPercentage)}%)`);
  }

  get fillerSpamPercentage() {
    return this._unnecessaryFillerSpells / this._totalGCDSpells;
  }

  isHastedAbilityOffCooldown(lastCast, timestamp, baseCD) {
    if (lastCast + (baseCD * 1000) < timestamp) {
      return true;
    }
    /**
     * General algorithm:
     *
     * find haste value at time of last cast
     * while the next haste change is < timestamp:
     *  time at that haste value = next haste change - last haste value
     *  effectiveCD = time at haste value * haste value
     *  baseCD -= effectiveCD
     *  if (baseCD < 0) return true
     *
     * do ^ one more time to account for partial haste value
     *
     * return false if spell is still on cd
     */
    let remainingCD = baseCD * 1000;
    let hasteAtCastIndex = this._hasteLog.findIndex(({ timestamp }) => timestamp > lastCast);
    if (hasteAtCastIndex === -1) {
      hasteAtCastIndex = this._hasteLog.length - 1;
    }
    let nextHasteChange = hasteAtCastIndex + 1;
    debug && console.log('Last cast: ', formatTime(this.owner.fight.start_time, lastCast), `(${formatTime(lastCast, timestamp)} ago)`);
    do {
      let hasteEnd = timestamp;
      if (nextHasteChange < this._hasteLog.length) {
        hasteEnd = Math.min(timestamp, this._hasteLog[nextHasteChange].timestamp);
      }

      const hasteStart = Math.max(lastCast, this._hasteLog[hasteAtCastIndex].timestamp);

      debug && console.log('Current haste buff:', this._hasteLog[hasteAtCastIndex].haste, '[', formatTime(this.owner.fight.start_time, hasteStart), '-', formatTime(this.owner.fight.start_time, hasteEnd), ']');
      const durationOfHaste = hasteEnd - hasteStart;
      const effectiveCD = durationOfHaste * (1 + this._hasteLog[hasteAtCastIndex].haste);
      debug && console.log(`Effective CD: ${effectiveCD / 1000}s`);
      remainingCD -= effectiveCD;
      debug && console.log(`Remaining: ${remainingCD / 1000}s`);
      if (remainingCD < 0) {
        debug && console.groupEnd();
        return true;
      }
      hasteAtCastIndex += 1;
      nextHasteChange += 1;
    } while(hasteAtCastIndex < this._hasteLog.length);  //&& this._hasteLog[nextHasteChange].timestamp < timestamp);

    debug && console.log('Done')
    debug && console.groupEnd();
    return false;
  }

  recordHasteChange(newHaste, timestamp) {
    if (this._hasteLog.length === 0) {
      this._hasteLog.push({ timestamp, haste: newHaste });
    }

    const lastHasteIndex = this._hasteLog.length - 1;
    const lastHaste = this._hasteLog[lastHasteIndex];

    if (lastHaste.timestamp === timestamp) {
      // If the haste change occured simultaneously with another haste change,
      // treat it as a single change
      this._hasteLog[lastHasteIndex].haste = newHaste;
    }

    if (lastHaste.haste !== newHaste) {
      // Conversely, only record a haste change if there was actually a change
      this._hasteLog.push({ timestamp, haste: newHaste });
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BEAR_SWIPE.id} />}
        value={`${formatPercentage(this.fillerSpamPercentage)}%`}
        label='Unnecessary Fillers'
        tooltip={`You cast <strong>${this._unnecessaryFillerSpells}</strong> unnecessary filler spells out of <strong>${this._totalGCDSpells}</strong> total GCDs.  Filler spells (Swipe, Moonfire without a GG proc, or Moonfire outside of pandemic if talented into Incarnation) do far less damage than your main rotational spells, and should be minimized whenever possible.`}
      />
    );
  }
}

export default AntiFillerSpam;

function formatTime(start, timestamp) {
  return `${((timestamp - start) / 1000).toFixed(2)}s`;
}
