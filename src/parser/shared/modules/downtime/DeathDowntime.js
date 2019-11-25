import Analyzer from 'parser/core/Analyzer';

/**
 * Tracks the amount of time (and instances when) the player was dead.
 * Example log where this is relevant (Argus M):
 * http://localhost:3000/report/J7xvPqaG6WdmnXrV/22-Mythic+Argus+the+Unmaker+-+Kill+(8:10)/132-Mufre
 */
class DeathDowntime extends Analyzer {
  _lastDeathTimestamp = null;
  _isAlive = true;
  _deathHistory = [];

  get totalDowntime() {
    return this._deathHistory.reduce((total, death) => total + death.duration, 0);
  }
  get downtimeHistory() {
    return this._deathHistory;
  }

  die(event) {
    if (!this._isAlive) {
      // Some boss mechanics trigger death events when already dead (e.g. M Argus where you die on purpose before the mechanic)
      console.warn('Player died while already dead.', event);
      return;
    }
    this._lastDeathTimestamp = event.timestamp;
    this._isAlive = false;
  }
  resurrect(resurrectionTimestamp) {
    this._deathHistory.push({
      from: this._lastDeathTimestamp,
      until: resurrectionTimestamp,
      duration: resurrectionTimestamp - this._lastDeathTimestamp,
    });
    this._lastDeathTimestamp = null;
    this._isAlive = true;
  }
  on_fightend() {
    if (!this._isAlive) {
      this.resurrect(this.owner.currentTimestamp);
    }
  }

  on_toPlayer_death(event) {
    this.die(event);
  }
  on_toPlayer_resurrect(event) {
    this.resurrect(event.timestamp);
  }
  on_byPlayer_cast(event) {
    if (!this._isAlive) {
      console.warn('Player magically resurrected', event);
      this.resurrect(event.timestamp);
    }
  }
  on_byPlayer_begincast(event) {
    if (!this._isAlive) {
      console.warn('Player magically resurrected', event);
      this.resurrect(event.timestamp);
    }
  }
}

export default DeathDowntime;
