import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

import SPELLS from 'common/SPELLS';

const halfHP = 0.5;

class Spreadsheet extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  potentialSurgingTideProcs = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.RIPTIDE.id && !event.tick) {
      const currentHealth = Math.max(0, (event.hitPoints - event.amount) / event.maxHitPoints);
      if (currentHealth >= halfHP) {
        return;
      }
      this.potentialSurgingTideProcs += 1;
    }
  }

  get surgingTideProcsPerMinute() {
    return (this.potentialSurgingTideProcs / (this.owner.fightDuration / 1000 / 60)).toFixed(2);
  }
}

export default Spreadsheet;
