import Enemies from './Enemies';
import EnemyInstance from '../../core/EnemyInstance';

const debug = false;

class EnemyInstances extends Enemies {
  getEntity(event) {
    if (event.targetIsFriendly) {
      return null;
    }
    const targetId = event.targetID;
    const targetInstance = event.targetInstance;

    const enemyId = encodeTargetString(targetId, targetInstance);

    let enemy = this.enemies[enemyId];
    if (!enemy) {
      const baseInfo = this.owner.report.enemies.find(enemy => enemy.id === targetId);
      if (!baseInfo) {
        debug && console.warn('Enemy not noteworthy enough:', targetId, event);
        return null;
      }
      this.enemies[enemyId] = enemy = new EnemyInstance(this.owner, baseInfo, targetInstance);
    }
    return enemy;
  }
}

export default EnemyInstances;

export function encodeTargetString(id, instance = 0) {
  return `${id}.${instance}`;
}

export function decodeTargetString(string) {
  const [ id, instance = 0 ] = string.split('.');
  return { id, instance };
}
