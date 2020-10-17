import Analyzer from 'parser/core/Analyzer';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import Events from 'parser/core/Events';

/**
 * Adds HP Percent information to the Enemy Entity
 * @extends Analyzer
 */
class EnemyHpTracker extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };

  constructor(options){
    super(options);
    this.addEventListener(Events.damage, this.onDamage);
  }

  onDamage(event) {
    if(event.targetIsFriendly) {
      return;
    }

    const enemy = this.enemies.getEntity(event);
    if(enemy && event.hitPoints && event.maxHitPoints && event.maxHitPoints !== 0) {
      enemy.hpPercent = event.hitPoints / event.maxHitPoints;
    }
  }
}

export default EnemyHpTracker;
