import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

class Lifebloom extends Module {
  get uptime() {
  return Object.keys(this.owner.combatants.players)
    .map(key => this.owner.combatants.players[key])
    .reduce((uptime, player) =>
      uptime + player.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id),0);
  }
}

export default Lifebloom;
