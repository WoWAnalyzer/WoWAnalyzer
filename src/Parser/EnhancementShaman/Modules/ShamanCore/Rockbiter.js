import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const MAELSTROM_THRESHOLD = 95;//120 is threshold, but energize event values are after the 25 Maelstrom increase is applied

class Rockbiter extends Module {
  rockbiterOveruse = [];
  maelstromWasted = 0;

  on_byPlayer_energize(event) {
    if (event.ability.guid === SPELLS.ROCKBITER.id) {
      if (event.classResources && event.classResources[0].amount >= MAELSTROM_THRESHOLD) {
        this.rockbiterOveruse.push(event);
        this.maelstromWasted += event.waste;
      }
    }
  }

  on_finished() {
    console.log(`maelstromWasted ${this.maelstromWasted}`);
    console.log(this.rockbiterOveruse);
  }

  suggestions(when) {
    when(this.maelstromWasted).isGreaterThan(100)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Try to minimize Maelstrom wastage as much as possible. Some of wasted MS is unavoidable due to maintaining Landslide buff ')
          .icon(SPELLS.ROCKBITER.icon)
          .actual(`${actual} wasted Maelstrom in ${this.rockbiterOveruse.length} RB uses`)
          .recommended(`No more than ${recommended} is recommended`)
          .regular(recommended + 50).major(recommended + 100);
      });
  }
}

export default Rockbiter;
