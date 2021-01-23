import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import Events from 'parser/core/Events';

// time after a cast in which direct damage from the spellId will be associated with the cast
const DAMAGE_WINDOW = 250; //ms

/**
 * Count how many targets the player's AoE attack hits. Can be a useful measure of how effectively
 * an ability is being used.
 */
class HitCountAoE extends Analyzer {
  get averageTargetsHit() {
    if (this.casts === 0) {
      return 0;
    }
    return (this.totalHits / this.casts);
  }

  get averageTargetsHitNotIncludingZeroCasts() {
    if (this.casts === 0) {
      return 0;
    }
    return (this.totalHits / (this.casts - this.castsWithZeroHits));
  }

  get hitZeroPerMinute() {
    return (this.castsWithZeroHits / this.owner.fightDuration) * (1000 * 60);
  }

  get hitJustOnePerMinute() {
    return (this.castsWithOneHit / this.owner.fightDuration) * (1000 * 60);
  }

  // A spell object from SPELLS
  static spell = null;
  casts = 0;
  totalHits = 0;
  castsWithZeroHits = 0;
  castsWithOneHit = 0;
  lastCastEvent = null;
  lastCastHits = 0;

  constructor(options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.constructor.spell), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(this.constructor.spell), this.onDamage);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  onCast(event) {
    this.finalizePreviousCast();
    this.casts += 1;
    this.lastCastEvent = event;
    this.lastCastHits = 0;
  }

  onDamage(event) {
    if (event.tick ||
      !this.lastCastEvent || ((event.timestamp - this.lastCastEvent.timestamp) > DAMAGE_WINDOW)) {
      // only interested in direct damage from the spellId shortly after cast
      return;
    }
    this.totalHits += 1;
    this.lastCastHits += 1;
  }

  onFightend() {
    this.finalizePreviousCast();
  }

  finalizePreviousCast() {
    if (!this.lastCastEvent) {
      return;
    }
    if (this.lastCastHits === 0) {
      this.castsWithZeroHits += 1;
    }
    if (this.lastCastHits === 1) {
      this.castsWithOneHit += 1;
    }
  }

  generateStatistic(statisticPosition) {
    if (this.casts === 0) {
      // Only show statistic if the ability is used.
      return null;
    }
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            You used {this.constructor.spell.name} <strong>{this.casts}</strong> time{(this.casts === 1) ? '' : 's'}.<br />
            <ul>
              <li><strong>{this.castsWithOneHit}</strong> hit just 1 target.</li>
              <li><strong>{this.castsWithZeroHits}</strong> hit nothing at all</li>
            </ul>
          </>
        )}
        position={statisticPosition}
      >
        <BoringSpellValueText spell={this.constructor.spell}>
          <>
            {this.averageTargetsHit.toFixed(1)} <small>average targets hit</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HitCountAoE;
