import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const MAELSTROM_THRESHOLD = 95;//120 is threshold, but energize event values are after the 25 Maelstrom increase is applied

class Rockbiter extends Module {
  rockbiterOveruse = [];
  maelstromWasted = 0;

  on_byPlayer_energize(event) {
    if(event.ability.guid === SPELLS.ROCKBITER.id) {
      if(event.classResources[0].amount >= MAELSTROM_THRESHOLD) {
        this.rockbiterOveruse.push(event);
        this.maelstromWasted+= event.waste;
      }
    }
  }

  on_finished() {
    console.log("maelstromWasted " + this.maelstromWasted);
    console.log(this.rockbiterOveruse);
  }

  suggestions(when) {
    when(this.rockbiterOveruse.length).isGreaterThan(10)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Using Rockbiter when Maelstrom is at 120+ is wasted Maelstrom. You wasted ${this.maelstromWasted} Maelstrom`)
          .icon(SPELLS.ROCKBITER.icon)
          .actual(`${this.rockbiterOveruse.length} uses at 120 or more Maelstrom`)
          .recommended(`No more than ${recommended} is recommended`)
          .regular(recommended+10).major(recommended+15);
      });
  }
}

export default Rockbiter;
