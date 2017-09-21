import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const PANDEMIC_THRESHOLD = 11500;
const debug = false;

class Pandemic extends Module {
  flametongueTimestamp = 0;
  earlyRefresh = 0;
  refreshTimestamps = [];

  on_byPlayer_applybuff(event) {
    if(event.ability.guid === SPELLS.FLAMETONGUE_BUFF.id) {
      if(this.flametongueTimestamp !== 0) {
        if(event.timestamp - this.flametongueTimestamp < PANDEMIC_THRESHOLD) {
          this.earlyRefresh += 1;
          this.refreshTimestamps.push(event.timestamp);
        }
      }
      this.flametongueTimestamp = event.timestamp;
    }
  }

  on_byPlayer_refreshbuff(event) {
    if(event.ability.guid === SPELLS.FLAMETONGUE_BUFF.id) {
      if(this.flametongueTimestamp !== 0) {
        if(event.timestamp - this.flametongueTimestamp < PANDEMIC_THRESHOLD) {
          this.earlyRefresh += 1;
          this.refreshTimestamps.push(event.timestamp);
        }
      }
      this.flametongueTimestamp = event.timestamp;
    }
  }

  on_finished() {
    debug && console.log("this.refreshTimestamps");
    debug && console.log(this.refreshTimestamps);
  }

  suggestions(when) {
    when(this.earlyRefresh).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Avoid refreshing Flametongue with more then 4.5 sec left on the buff. Some early refreshes are unavoidable.`)
          .icon(SPELLS.FLAMETONGUE_BUFF.icon)
          .actual(`${actual} early refreshes`)
          .recommended(`${(recommended)} recommended`)
          .regular(recommended+2).major(recommended + 5);
      });
  }
}

export default Pandemic;
