import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

const MAELSTROM_THRESHOLD = 95;//120 is threshold, but energize event values are after the 25 Maelstrom increase is applied
const debug = false;

class Rockbiter extends Analyzer {
  rockbiterOveruse = 0;
  rockbiterTotalCasts = 0;
  maelstromWasted = 0;
  overusePercentage = 0;

  on_byPlayer_energize(event) {
    if (event.ability.guid === SPELLS.ROCKBITER.id) {
      this.rockbiterTotalCasts += 1;
      if (event.classResources && event.classResources[0].amount >= MAELSTROM_THRESHOLD) {
        this.rockbiterOveruse += 1;
      }

      if(event.waste > 0) {
        this.maelstromWasted += event.waste;
      }

      this.overusePercentage = this.rockbiterOveruse / this.rockbiterTotalCasts;
    }
  }

  on_finished() {
    debug && console.log("maelstromWasted " + this.maelstromWasted);
    debug && console.log(this.rockbiterOveruse);
  }

  suggestions(when) {
    when(this.maelstromWasted).isGreaterThan(100)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Try to minimize Maelstrom wastage as much as possible. Some of wasted MS is unavoidable due to maintaining Landslide buff ')
          .icon(SPELLS.ROCKBITER.icon)
          .actual(`${actual} wasted Maelstrom in ${this.rockbiterOveruse} of ${this.rockbiterTotalCasts} (${formatPercentage(this.overusePercentage, 0)}%) casts`)
          .recommended(`No more than ${recommended} is recommended`)
          .regular(recommended + 50).major(recommended + 100);
      });
  }
}

export default Rockbiter;
