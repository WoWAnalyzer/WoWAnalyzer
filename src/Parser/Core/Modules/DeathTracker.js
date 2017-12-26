import React from 'react';

import { formatMilliseconds } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = true;

class DeathTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  deathTimestamp = 0;
  resurrectTimestamp = 0;
  timeDead = 0;
  castCount = 0;
  isAlive = true;

  on_toPlayer_death(event) {
    this.deathTimestamp = this.owner.currentTimestamp;
    if (debug) {console.log("Player Died @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));}
    this.isAlive = false;
  }

  on_toPlayer_resurrect(event) {
    this.resurrectTimestamp = this.owner.currentTimestamp;
    this.timeDead += this.resurrectTimestamp - this.deathTimestamp;
    if (debug) {console.log("Player was Resurrected @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));}
    this.isAlive = true;
  }

  on_byPlayer_cast(event) {
    this.castCount += 1;
  }

  on_finished() {
    if (this.isAlive === false) {
      this.timeDead += this.owner.currentTimestamp - this.deathTimestamp;
    }
  }

  suggestions(when) {
      when(this.castCount).isLessThan(1)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You did not cast a single spell this fight. You were either dead for the entire fight, or were AFK.</span>)
            .icon('ability_fiegndead')
            .major(1);
      });
    }
  }

export default DeathTracker;
