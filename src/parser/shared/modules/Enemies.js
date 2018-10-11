import Entities from './Entities';
import Enemy from '../../core/Enemy';

const debug = true;

class Enemies extends Entities {
  enemies = {};
  getEntities() {
    return this.enemies;
  }
  /**
   * @param {object} event
   * @returns {Enemy|null}
   */
  getEntity(event) {
    if (event.targetIsFriendly) {
      return null;
    }
    const targetId = event.targetID;
    let enemy = this.enemies[targetId];
    if (!enemy) {
      const baseInfo = this.owner.report.enemies.find(enemy => enemy.id === targetId);
      if (!baseInfo) {
        debug && console.warn('Enemy not noteworthy enough:', targetId, event);
        return null;
      }
      this.enemies[targetId] = enemy = new Enemy(this.owner, baseInfo);
    }
    return enemy;
  }
}

export default Enemies;
