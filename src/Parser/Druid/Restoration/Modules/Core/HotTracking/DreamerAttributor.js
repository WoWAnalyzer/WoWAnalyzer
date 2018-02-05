import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import HotTracker from './HotTracker';

/*
 * Backend module tracks attribution of Dreamer
 */
class DreamerAttributor extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTracker,
  };

  t214p = { name: 'T21 4pc', healing: 0, masteryHealing: 0, procs: 0 }; // used to distinguish Dreamer procs that would not have happened but for the 4pc
  t212p = { name: 'T21 2pc', healing: 0, masteryHealing: 0, procs: 0 }; // for all the Dreamer procs except those attributable to 4pc
  remaining4t21attributes = 0;

  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.AWAKENED.id) {
      // 4t21 proc causes 5 dreamer procs that would not otherwise have happened
      // while in reality there is usually a quick sequence of 6 dreamers, one of which is "natural",
      // we simplify by attributing the next 5 to 4t21
      this.remaining4t21attributes = 5;
    }

    this._getDreamerAttribution(event);
  }

  on_byPlayer_refreshbuff(event) {
    this._getDreamerAttribution(event);
  }

  // gets attribution for a given applybuff/refreshbuff of Dreamer
  _getDreamerAttribution(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (spellId !== SPELLS.DREAMER.id) {
      return;
    }
    if(!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][spellId]) {
      return;
    }

    const attributions = [];

    if (this.remaining4t21attributes > 0) {
      attributions.push(this.t214p);
      this.remaining4t21attributes -= 1;
    } else {
      attributions.push(this.t212p);
    }

    attributions.forEach(att => {
      this.hotTracker.addAttribution(att, targetId, spellId);
    });
  }
}

export default DreamerAttributor;
