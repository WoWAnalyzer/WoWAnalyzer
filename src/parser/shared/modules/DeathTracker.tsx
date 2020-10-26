import React from 'react';
import { Link } from 'react-router-dom';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import Events, { BeginCastEvent, CastEvent, DamageEvent, DeathEvent, HealEvent, ResurrectEvent } from '../../core/Events';

const WIPE_MAX_DEAD_TIME = 15 * 1000; // 15sec

const debug = false;

// Log where someone died: https://wowanalyzer.com/report/RjH6AnYdP8GWzX4h/2-Heroic+Aggramar+-+Kill+(6:23)/Kantasai
class DeathTracker extends Analyzer {
  deaths: DeathEvent[] = [];
  resurrections: Array<CastEvent | BeginCastEvent | HealEvent | DamageEvent | ResurrectEvent> = [];

  lastDeathTimestamp: number = 0;
  lastResurrectionTimestamp: number = 0;
  _timeDead: number = 0
  _didCast: boolean = false;
  isAlive: boolean = true;

  die(event: DeathEvent) {
    this.lastDeathTimestamp = this.owner.currentTimestamp;
    debug && this.log('Player Died');
    this.isAlive = false;
    this.deaths.push(event);
  }
  resurrect(event: CastEvent | BeginCastEvent | HealEvent | DamageEvent | ResurrectEvent) {
    this.lastResurrectionTimestamp = this.owner.currentTimestamp;
    this._timeDead += this.lastResurrectionTimestamp - this.lastDeathTimestamp;
    debug && this.log('Player was Resurrected');
    this.isAlive = true;
    this.resurrections.push(event);
  }

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.onDeath);
    this.addEventListener(Events.resurrect.to(SELECTED_PLAYER), this.onResurrect);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER), this.onBeginCast);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHealTaken);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDeath(event: DeathEvent) {
    this.die(event);
  }
  onResurrect(event: ResurrectEvent) {
    this.resurrect(event);
  }
  onCast(event: CastEvent) {
    this._didCast = true;

    if (!this.isAlive) {
      this.resurrect(event);
    }
  }
  onBeginCast(event: BeginCastEvent) {
    if (!this.isAlive) {
      this.resurrect(event);
    }
  }
  onHealTaken(event: HealEvent) {
    if (!this.isAlive) {
      this.resurrect(event);
    }
  }
  onDamageTaken(event: DamageEvent) {
    if (!this.isAlive) {
      this.resurrect(event);
    }
  }

  get totalTimeDead() {
    return this._timeDead + (this.isAlive ? 0 : this.owner.currentTimestamp - this.lastDeathTimestamp);
  }
  get timeDeadPercent() {
    return this.totalTimeDead / this.owner.fightDuration;
  }

  get deathSuggestionThresholds() {
    return {
      actual: this.timeDeadPercent,
      isGreaterThan: {
        major: 0.00,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    const boss = this.owner.boss;
    const fight = this.owner.fight;
    const player = this.owner.player;
    const report = this.owner.report;
    const disableDeathSuggestion = boss && boss.fight.disableDeathSuggestion;
    const isWipe = !fight.kill;
    const isWipeDeath = isWipe && this.totalTimeDead < WIPE_MAX_DEAD_TIME;

    if (!disableDeathSuggestion && !isWipeDeath) {
      when(this.timeDeadPercent).isGreaterThan(0)
        .addSuggestion((suggest, actual) => suggest(<>
            You died during this fight and were dead for {formatPercentage(actual)}% of the fight duration ({formatNumber(this.totalTimeDead / 1000)} seconds). Dying has a significant performance cost. View the <Link to={makeAnalyzerUrl(report, fight.id, player.id, 'death-recap')}>Death Recap</Link> to see the damage taken and what defensives and potions were still available.
          </>)
            .icon('ability_fiegndead')
            .actual(i18n._(t('shared.suggestions.deathTracker.deathTime')`You were dead for ${formatPercentage(actual)}% of the fight`))
            .recommended('0% is recommended')
            .major(this.deathSuggestionThresholds.isGreaterThan.major));
    }
    when(this._didCast).isFalse()
      .addSuggestion((suggest) => suggest('You did not cast a single spell this fight. You were either dead for the entire fight, or were AFK.')
          .icon('ability_fiegndead')
          .major(this.deathSuggestionThresholds.isGreaterThan.major));
  }
}

export default DeathTracker;
