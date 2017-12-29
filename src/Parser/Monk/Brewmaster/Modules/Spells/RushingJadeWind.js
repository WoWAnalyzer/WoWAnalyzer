import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

// the buff events all use this spell
export const RUSHING_JADE_WIND_BUFF = SPELLS.RUSHING_JADE_WIND_TALENT; 

class RushingJadeWind extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  inactiveDuration = 0;
  _lastDropped = 0;
  _active = false;

  on_initialized() {
    this._lastDropped = this.owner.fight.start_time;
    this.active = this.combatants.selected.hasTalent(SPELLS.RUSHING_JADE_WIND_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    if(event.ability.guid === RUSHING_JADE_WIND_BUFF.id) {
      this.inactiveDuration += event.timestamp - this._lastDropped;
      this._active = true;
      debug && console.log("RJW re-applied", event.timestamp, this.inactiveDuration);
    }
  }

  on_byPlayer_removebuff(event) {
    if(event.ability.guid === RUSHING_JADE_WIND_BUFF.id) {
      this._lastDropped = event.timestamp;
      this._active = false;
      debug && console.log("RJW dropped", event.timestamp);
    }
  }

  on_finished() {
    if(!this._active) {
      this.inactiveDuration += this.owner.fight.end_time - this._lastDropped;
    }
  }

  get uptime() {
    if(this.owner.fightDuration === 0) {
      return 0;
    }
    const downtime = this.inactiveDuration / this.owner.fightDuration;
    return 1.0 - downtime;
  }

  // using a suggestion rather than a checklist item for this as RJW is
  // purely offensive
  suggestions(when) {
    when(this.uptime).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You had low uptime on <SpellLink id={SPELLS.RUSHING_JADE_WIND.id} />. Try to maintain 100% uptime by refreshing the buff before it drops.</span>)
          .icon(SPELLS.RUSHING_JADE_WIND.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.2);
      });
  }
}

export default RushingJadeWind;
