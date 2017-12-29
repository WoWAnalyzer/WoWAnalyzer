import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = true;

// the buff events all use this spell
const RUSHING_JADE_WIND_BUFF = SPELLS.RUSHING_JADE_WIND_TALENT; 

class RushingJadeWind extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  inactiveDuration = 0;
  _lastDropped = 0;

  on_initialized() {
    this._lastDropped = this.owner.fight.start_time;
    this.active = this.combatants.selected.hasTalent(SPELLS.RUSHING_JADE_WIND_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    if(event.ability.guid === RUSHING_JADE_WIND_BUFF.id) {
      this.inactiveDuration += event.timestamp - this._lastDropped;
      debug && console.log("RJW re-applied", this.inactiveDuration);
    }
  }

  on_byPlayer_removebuff(event) {
    if(event.ability.guid === RUSHING_JADE_WIND_BUFF.id) {
      this._lastDropped = event.timestamp;
      debug && console.log("RJW dropped");
    }
  }

  // using a suggestion rather than a checklist item for this as RJW is
  // purely offensive
  suggestions(when) {
    console.log(this.owner.fightDuration);
    const fightDuration = this.owner.fight.end_time - this.owner.fight.start_time;
    const downtime = this.inactiveDuration / fightDuration;
    const uptime = 1.0 - downtime;
    console.log(this.inactiveDuration);
    when(uptime).isLessThan(0.95)
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
