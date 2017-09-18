import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class Lifebloom extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  get uptime() {
    return Object.keys(this.combatants.players)
      .map(key => this.combatants.players[key])
      .reduce((uptime, player) =>
        uptime + player.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id), 0);
  }
}

export default Lifebloom;
