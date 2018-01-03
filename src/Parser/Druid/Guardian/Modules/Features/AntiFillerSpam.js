import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import EnemyInstances from 'Parser/Core/Modules/EnemyInstances';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import GlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';
import StatisticBox from 'Main/StatisticBox';

import Abilities from '../Abilities';
import ActiveTargets from './ActiveTargets';

const debug = false;

// Determines whether a variable is a function or not, and returns its value
function resolveValue(maybeFunction, ...args) {
  if (typeof maybeFunction === 'function') {
    return maybeFunction(...args);
  }

  return maybeFunction;
}

class AntiFillerSpam extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemyInstances: EnemyInstances,
    activeTargets: ActiveTargets,
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,
    abilities: Abilities,
  };

  abilityLastCasts = {};
  _totalGCDSpells = 0;
  _totalFillerSpells = 0;
  _unnecessaryFillerSpells = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const ability = this.abilities.getAbility(spellId);
    if (!ability) {
      return;
    }

    this._totalGCDSpells += 1;
    const timestamp = event.timestamp;
    const spellLastCast = this.abilityLastCasts[spellId] || -Infinity;
    const targets = this.activeTargets.getActiveTargets(event.timestamp).map(enemyID => this.enemyInstances.enemies[enemyID]).filter(enemy => !!enemy);
    const combatant = this.combatants.selected;
    this.abilityLastCasts[spellId] = timestamp;

    let isFiller = false;
    if (ability.antiFillerSpam) {
      if (typeof ability.antiFillerSpam.isFiller === 'function') {
        isFiller = ability.antiFillerSpam.isFiller(event, combatant, targets, spellLastCast);
      } else {
        isFiller = ability.antiFillerSpam.isFiller;
      }
    }

    if (!isFiller) {
      return;
    }

    debug && console.group(`[FILLER SPELL] - ${spellId} ${SPELLS[spellId].name}`);

    this._totalFillerSpells += 1;

    const availableSpells = [];
    // Only abilities on the GCD matter since the goal is to make sure every GCD is used as efficiently as possible
    this.globalCooldown.abilitiesOnGlobalCooldown
      .map(spellId => this.abilities.getAbility(spellId))
      .filter(ability => ability !== null)
      .forEach(gcdSpell => {
        const gcdSpellId = gcdSpell.primarySpell.id;
        if (ability.primarySpell.id === gcdSpellId) {
          return;
        }

        const lastCast = this.abilityLastCasts[gcdSpellId] || -Infinity;
        const isFillerEval = gcdSpell.antiFillerSpam && (typeof gcdSpell.antiFillerSpam.isFiller === 'function' ? gcdSpell.antiFillerSpam.isFiller(event, combatant, targets, lastCast) : gcdSpell.antiFillerSpam.isFiller);
        if (isFillerEval || gcdSpell.category === Abilities.SPELL_CATEGORIES.UTILITY) {
          return;
        }

        const isOffCooldown = this.spellUsable.isAvailable(gcdSpellId);

        const args = [event, combatant, targets, lastCast];
        const meetsCondition = (gcdSpell.antiFillerSpam.condition !== undefined) ? resolveValue(gcdSpell.antiFillerSpam.condition, ...args) : true;

        if (!meetsCondition) {
          return;
        }

        if (!isOffCooldown) {
          return;
        }

        debug && console.warn(`
          [Available non-filler]
          - ${gcdSpellId} ${SPELLS[gcdSpellId].name}
          - offCD: ${isOffCooldown}
          - canBeCast: ${meetsCondition}
        `);
        availableSpells.push(gcdSpellId);
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
        icon={<SpellIcon id={SPELLS.SWIPE_BEAR.id} />}
        value={`${formatPercentage(this.fillerSpamPercentage)}%`}
        label="Unnecessary Fillers"
        tooltip={`You cast <strong>${this._unnecessaryFillerSpells}</strong> unnecessary filler spells out of <strong>${this._totalGCDSpells}</strong> total GCDs.  Filler spells (Swipe, Moonfire without a GG proc, or Moonfire outside of pandemic if talented into Incarnation) do far less damage than your main rotational spells, and should be minimized whenever possible.`}
      />
    );
  }

  suggestions(when) {
    when(this.fillerSpamPercentage).isGreaterThan(0.1)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <Wrapper>
            You are casting too many unnecessary filler spells. Try to plan your casts two or three GCDs ahead of time to anticipate your main rotational spells coming off cooldown, and to give yourself time to react to <SpellLink id={SPELLS.GORE_BEAR.id} /> and <SpellLink id={SPELLS.GALACTIC_GUARDIAN_TALENT.id} /> procs.
          </Wrapper>
        )
          .icon(SPELLS.SWIPE_BEAR.icon)
          .actual(`${formatPercentage(actual)}% unnecessary filler spells cast`)
          .recommended(`${formatPercentage(recommended, 0)}% or less is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.1);
      });
  }
}

export default AntiFillerSpam;
