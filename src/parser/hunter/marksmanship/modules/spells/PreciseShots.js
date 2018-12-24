import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/hunter';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';

/**
 * Aimed Shot causes your next 1-2 Arcane Shots or Multi-Shots to deal 100% more damage.
 */

//TODO: Add a suggestion for Aimed Shotting when Precise Shots is active + some conditionals, but wait for 8.1 for Marksmanship minor rework before doing so.

const ASSUMED_PROCS = 2; //Logs give no indication whether we gain 1 or 2 stacks - we assume 2 and work from there.
const PRECISE_SHOTS_MODIFIER = 0.75;
const MAX_TRAVEL_TIME = 500;

class PreciseShots extends Analyzer {

  damage = 0;
  buffsActive = 0;
  buffsGained = 0;
  minOverwrittenProcs = 0;
  maxOverwrittenProcs = 0;
  buffedShotInFlight = null;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRECISE_SHOTS.id) {
      return;
    }
    this.buffsActive = ASSUMED_PROCS;
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRECISE_SHOTS.id) {
      return;
    }
    this.buffsGained += 1;
    this.buffsActive = 0;
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRECISE_SHOTS.id) {
      return;
    }
    this.minOverwrittenProcs += 1;
    this.maxOverwrittenProcs += 2;
    this.buffsActive = ASSUMED_PROCS;
  }

  on_byPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRECISE_SHOTS.id) {
      return;
    }
    this.buffsGained += 1;
    this.buffsActive -= 1;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.PRECISE_SHOTS.id) || (spellId !== SPELLS.ARCANE_SHOT.id && spellId !== SPELLS.MULTISHOT_MM.id)) {
      return;
    }
    this.buffedShotInFlight = event.timestamp;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (this.buffedShotInFlight && this.buffedShotInFlight > event.timestamp + MAX_TRAVEL_TIME) {
      this.buffedShotInFlight = null;
    }
    if (spellId !== SPELLS.ARCANE_SHOT.id && spellId !== SPELLS.MULTISHOT_MM.id) {
      return;
    }
    if (this.buffedShotInFlight && this.buffedShotInFlight < event.timestamp + MAX_TRAVEL_TIME) {
      this.damage += calculateEffectiveDamage(event, PRECISE_SHOTS_MODIFIER);
    }
    if (spellId === SPELLS.ARCANE_SHOT.id) {
      this.buffedShotInFlight = null;
    }
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(17)}
        icon={<SpellIcon id={SPELLS.PRECISE_SHOTS.id} />}
        value={`${this.buffsGained} buffs used`}
        label={`Precise Shots`}
        tooltip={`You wasted between ${this.minOverwrittenProcs} and ${this.maxOverwrittenProcs} Precise Shots procs by casting Aimed Shot when you already had Precise Shots active`}
      />
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.PRECISE_SHOTS.id} />}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
}

export default PreciseShots;
