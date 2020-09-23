import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemDamageDone from 'interface/ItemDamageDone';
import Abilities from 'parser/core/modules/Abilities';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';

/**
 * Summons a flock of crows to attack your target over the next 15 sec. If the target dies while under attack, A Murder of Crows' cooldown is reset.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/GFM9qZQy63zbxh7L#fight=49&type=damage-done&source=299&ability=131900
 */

const CROWS_TICK_RATE = 1000;
const MS_BUFFER = 100;
const CROWS_DURATION = 15000;
const debug = false;

class AMurderOfCrows extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  damage = 0;
  casts = 0;
  applicationTimestamp: number = 0;
  lastDamageTick: number = 0;
  crowsEndingTimestamp: number = 0;
  maxCasts = 0;
  resets = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT.id);
    if (this.active) {
      options.abilities.add({
        spell: SPELLS.A_MURDER_OF_CROWS_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          maxCasts: () => this.maxCasts,
        },
      });
    }
    this.addEventListener(EventEmitter.catchAll, this.checkForReset);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.A_MURDER_OF_CROWS_TALENT), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.A_MURDER_OF_CROWS_DEBUFF), this.onDamage);
    this.addEventListener(Events.fightend, this.adjustMaxFights);
  }

  checkForReset(event: any) {
    // Checks if we've had atleast 1 damage tick of the currently applied crows, and checks that crows is in fact on cooldown.
    if (this.lastDamageTick && this.spellUsable.isOnCooldown(SPELLS.A_MURDER_OF_CROWS_TALENT.id)
      // Checks whether the current damage event happened while the time passed since crows application is less than the crows duration
      && this.applicationTimestamp && event.timestamp < this.crowsEndingTimestamp
      // Checks to see if more than 1 second has passed since last tick
      && event.timestamp > this.lastDamageTick + CROWS_TICK_RATE + MS_BUFFER) {
      // If more than 1 second has passed and less than the duration has elapsed, we can assume that crows has been reset, and thus we reset the CD.
      this.spellUsable.endCooldown(SPELLS.A_MURDER_OF_CROWS_TALENT.id, false, event.timestamp);
      this.maxCasts += 1;
      this.resets += 1;
      debug && this.log('Crows was reset');
    }
  }

  onCast() {
    this.casts += 1;
    this.applicationTimestamp = 0;
    this.lastDamageTick = 0;
  }

  onDamage(event: DamageEvent) {
    if (this.casts === 0) {
      this.casts += 1;
      this.spellUsable.beginCooldown(SPELLS.A_MURDER_OF_CROWS_TALENT.id, event);
      this.applicationTimestamp = this.owner.fight.start_time;
    }
    //This accounts for the travel time of crows, since the first damage marks the time where the crows debuff is applied
    if (this.lastDamageTick === 0 && this.applicationTimestamp === 0) {
      this.applicationTimestamp = event.timestamp;
      this.crowsEndingTimestamp = this.applicationTimestamp + CROWS_DURATION;
    }
    this.lastDamageTick = event.timestamp;
    this.damage += event.amount + (event.absorbed || 0);
  }

  adjustMaxFights() {
    this.maxCasts += Math.ceil(this.owner.fightDuration / 60000);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.A_MURDER_OF_CROWS_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} /><br />
            {this.resets} <small>resets</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AMurderOfCrows;
