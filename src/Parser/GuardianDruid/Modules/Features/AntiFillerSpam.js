import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import StatisticBox from 'Main/StatisticBox';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import EnemyInstances from 'Parser/Core/Modules/EnemyInstances';
import DynamicHaste from './DynamicHaste';

import ActiveTargets from './ActiveTargets';

const debug = false;

// The  amount of time after a proc has occurred when casting a filler is no longer acceptable
const REACTION_TIME_THRESHOLD = 500;

class AntiFillerSpam extends Module {
  static dependencies = {
    combatants: Combatants,
    enemyInstances: EnemyInstances,
    dynamicHaste: DynamicHaste,
    activeTargets: ActiveTargets,
  };

  abilityLastCasts = {};
  _totalGCDSpells = 0;
  _totalFillerSpells = 0;
  _unnecessaryFillerSpells = 0;

  on_byPlayer_cast(event) {
    const spellID = event.ability.guid;
    const spell = GCD_SPELLS[spellID];
    if (!spell) {
      return;
    }

    this._totalGCDSpells += 1;
    const timestamp = event.timestamp;
    const spellLastCast = this.abilityLastCasts[spellID] || -Infinity;
    const targets = this.activeTargets.getActiveTargets(event.timestamp).map(enemyID => this.enemyInstances.enemies[enemyID]).filter(enemy => !!enemy);
    const combatant = this.combatants.selected;
    this.abilityLastCasts[spellID] = timestamp;

    const isFillerEval = (typeof spell.isFiller === 'function') ? spell.isFiller(event, combatant, targets, spellLastCast) : spell.isFiller;
    if (!isFillerEval) {
      return;
    }

    debug && console.group(`[FILLER SPELL] - ${spellID} ${SPELLS[spellID].name}`);

    this._totalFillerSpells += 1;

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
          isOffCooldown = this.dynamicHaste.isHastedAbilityOffCooldown(lastCast, timestamp, baseCD);
        } else {
          isOffCooldown = timestamp - lastCast > baseCD;
        }
      }

      const hasProc = proc && ((typeof proc === 'function') ? proc(event, combatant, targets, lastCast) : proc);
      const meetsCondition = (condition !== undefined) ? ((typeof condition === 'function') ? condition(event, combatant, targets, lastCast) : condition) : true;


      if ((isOffCooldown || hasProc) && meetsCondition) {
        debug && console.warn(`[Available non-filler] - ${gcdSpellID} ${SPELLS[gcdSpellID].name} - offCD: ${isOffCooldown} - hasProc: ${hasProc} - canBeCast: ${meetsCondition}`);
        availableSpells.push(gcdSpellID);
      }
    });

    if (availableSpells.length > 0) {
      this._unnecessaryFillerSpells += 1;
    }
    debug && console.groupEnd();
  }

  get fillerSpamPercentage() {
    return this._unnecessaryFillerSpells / this._totalGCDSpells;
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

  suggestions(when) {
    when(this.fillerSpamPercentage).isGreaterThan(0.1)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are casting too many unnecessary filler spells. Try to plan your casts two or three GCDs ahead of time to anticipate your main rotational spells coming off cooldown, and to give yourself time to react to <SpellLink id={SPELLS.GORE_BEAR.id} /> and <SpellLink id={SPELLS.GALACTIC_GUARDIAN_TALENT.id} /> procs.</span>)
          .icon(SPELLS.BEAR_SWIPE.icon)
          .actual(`${formatPercentage(actual)}% unnecessary filler spells cast`)
          .recommended(`${formatPercentage(recommended, 0)}% or less is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.1);
      });
  }
}

export default AntiFillerSpam;

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
    // A spell must meet these conditions to be castable
    condition: ({ timestamp, targetID }, combatant, targets) => {
      const pulverizeTalented = combatant.lv100Talent === SPELLS.PULVERIZE_TALENT.id;

      const target = targets.find(t => t.id === targetID);
      if (!target) {
        return false;
      }

      const targetHasThrashStacks = target.hasBuff(SPELLS.THRASH_BEAR_DOT.id, timestamp).stacks >= 2;
      return pulverizeTalented && targetHasThrashStacks;
    },
  },
  [SPELLS.MAUL.id]: {
    isFiller: false,
    baseCD: null,
    // Maul should never be considered a replacement for filler, but it should be tracked
    condition: false,
  },

  // "Filler" spells
  [SPELLS.MOONFIRE.id]: {
    isFiller: ({ timestamp, targetID }, combatant, targets, lastCast) => {
      if (combatant.lv75Talent === SPELLS.GALACTIC_GUARDIAN_TALENT.id) {
        return (
          // Account for reaction time; the player must have had the proc for at least this long
          !combatant.hasBuff(SPELLS.GALACTIC_GUARDIAN.id, timestamp - REACTION_TIME_THRESHOLD)
        );
      }

      return (
        targets.every(target => target.hasBuff(SPELLS.MOONFIRE_BEAR.id, timestamp - 1)) // Moonfire was already ticking
      );

    },
    baseCD: null,
  },
  [SPELLS.BEAR_SWIPE.id]: {
    isFiller: (event, combatant, targets) => targets.length < 4,
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
