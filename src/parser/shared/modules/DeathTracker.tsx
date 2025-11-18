import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';

import Events, {
  BeginCastEvent,
  CastEvent,
  DamageEvent,
  DeathEvent,
  HealEvent,
  ResurrectEvent,
} from '../../core/Events';

const debug = false;

// Log where someone died: https://wowanalyzer.com/report/RjH6AnYdP8GWzX4h/2-Heroic+Aggramar+-+Kill+(6:23)/Kantasai
class DeathTracker extends Analyzer {
  deaths: DeathEvent[] = [];
  resurrections: (CastEvent | BeginCastEvent | HealEvent | DamageEvent | ResurrectEvent)[] = [];

  lastDeathTimestamp = 0;
  lastResurrectionTimestamp = 0;
  _timeDead = 0;
  _didCast = false;
  isAlive = true;

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

  constructor(options: Options) {
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
    return (
      this._timeDead + (this.isAlive ? 0 : this.owner.currentTimestamp - this.lastDeathTimestamp)
    );
  }

  get timeDeadPercent() {
    return this.totalTimeDead / this.owner.fightDuration;
  }

  get deathSuggestionThresholds() {
    return {
      actual: this.timeDeadPercent,
      isGreaterThan: {
        major: 0.0,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default DeathTracker;
