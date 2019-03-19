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

  getDebuffHistory(spellId) {
    const events = [];
    const enemies = this.getEntities();
    Object.values(enemies)
      .forEach(enemy => {
        enemy.getBuffHistory(spellId, this.owner.playerId)
          .forEach(buff => {
            events.push({
              timestamp: buff.start,
              type: 'apply',
              buff,
            });
            events.push({
              timestamp: buff.end !== null ? buff.end : this.owner.currentTimestamp, // buff end is null if it's still active, it can also be 0 if buff ended at pull
              type: 'remove',
              buff,
            });
          });
      });

    const history = [];
    let current = null;
    let active = 0;
    events.sort((a, b) => a.timestamp - b.timestamp)
      .forEach(event => {
        if (event.type === 'apply') {
          if (current === null) {
            current = { start: event.timestamp, end: null };
          }
          active += 1;
        }
        if (event.type === 'remove') {
          active -= 1;
          if (active === 0) {
            current.end = event.timestamp;
            history.push(current);
            current = null;
          }
        }
      });
    // if buff lasted till end of combat, maybe doesn't ever happen due to some normalizing
    if (current !== null) {
      history.push(current);
    }
    return history;
  }
}

export default Enemies;
