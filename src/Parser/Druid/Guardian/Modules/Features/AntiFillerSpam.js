import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage , formatDuration } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import EnemyInstances from 'Parser/Core/Modules/EnemyInstances';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
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
    abilities: Abilities,
  };

  _totalGCDSpells = 0;
  _totalFillerSpells = 0;
  _unnecessaryFillerSpells = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const ability = this.abilities.getAbility(spellId);
    if (!ability || !ability.isOnGCD) {
      return;
    }

    this._totalGCDSpells += 1;
    const targets = this.activeTargets.getActiveTargets(event.timestamp).map(enemyID => this.enemyInstances.enemies[enemyID]).filter(enemy => !!enemy);
    const combatant = this.combatants.selected;

    let isFiller = false;
    if (ability.antiFillerSpam) {
      if (typeof ability.antiFillerSpam.isFiller === 'function') {
        isFiller = ability.antiFillerSpam.isFiller(event, combatant, targets);
      } else {
        isFiller = ability.antiFillerSpam.isFiller;
      }
    }

    if (!isFiller) {
      return;
    }

    debug && console.group(`[FILLER SPELL] - ${spellId} ${SPELLS[spellId].name} - ${formatDuration((event.timestamp - this.owner.fight.start_time) / 1000)}`);

    this._totalFillerSpells += 1;
    const availableSpells = [];

    this.abilities.abilities
      .filter(ability => ability.antiFillerSpam)
      .forEach(gcdSpell => {
        const gcdSpellId = gcdSpell.primarySpell.id;
        if (ability.primarySpell.id === gcdSpellId) {
          return;
        }

        const isOffCooldown = this.spellUsable.isAvailable(gcdSpellId);
        const args = [event, combatant, targets];
        const isHighPriority = (gcdSpell.antiFillerSpam.isHighPriority !== undefined) ? resolveValue(gcdSpell.antiFillerSpam.isHighPriority, ...args) : false;

        if (!isOffCooldown || !isHighPriority) {
          return;
        }

        debug && console.warn(`
          [Available non-filler]
          - ${gcdSpellId} ${SPELLS[gcdSpellId].name}
          - offCD: ${isOffCooldown}
          - isHighPriority: ${isHighPriority}
        `);
        availableSpells.push(gcdSpell);
      });

    if (availableSpells.length > 0) {
      this._unnecessaryFillerSpells += 1;
      let text = '';
      for (let i = 0; i < availableSpells.length; i++){
        if (availableSpells[i].primarySpell.id === SPELLS.MOONFIRE.id) {
          text += 'a Galactic Guardian proc';
        } else {
          text += availableSpells[i].name;
        }
        if (i + 2 < availableSpells.length){
          text += ', ';
        } else if (i + 1 < availableSpells.length){
          text += ' and ';
        }
      }
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `This spell was cast while ${text} was available.`;
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
