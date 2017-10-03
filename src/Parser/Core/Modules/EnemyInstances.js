import Enemies from './Enemies';
import EnemyInstance from '../EnemyInstance';

const debug = true;

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
      debugger;
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
  const components = string.split('.');
  return {
    id: components[0],
    instance: components[1] || 0,
  };
}
