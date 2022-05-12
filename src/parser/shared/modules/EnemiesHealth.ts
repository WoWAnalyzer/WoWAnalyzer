import Analyzer, { Options } from 'parser/core/Analyzer';
import Enemy from 'parser/core/Enemy';
import Events, { AnyEvent, HasHitpoints, HasTarget } from 'parser/core/Events';

import { encodeTargetString } from './Enemies';

const debug = false;

interface EnemyHealth {
  enemy: Enemy | null;
  hitPoints: number;
  maxHitPoints: number;
  hitPointsPercent: number;
}

/**
 * Module that keep track of the health of enemies.
 */
class EnemiesHealth extends Analyzer {
  enemies: { [enemyId: number]: Enemy } = {};

  readonly enemyHealths: Record<string, Omit<EnemyHealth, 'enemy'>> = {};

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage, this.trackHealths);
  }

  /** Tracks health of all enemies so that we know the percentage when the trinket is used. */
  private trackHealths(event: AnyEvent) {
    if (!HasTarget(event) || !HasHitpoints(event)) {
      return;
    }

    const targetString = encodeTargetString(event.targetID, event.targetInstance);

    this.enemyHealths[targetString] = {
      hitPoints: event.hitPoints,
      maxHitPoints: event.maxHitPoints,
      hitPointsPercent: event.hitPoints / event.maxHitPoints,
    };
  }

  getHealthEnemy(event: AnyEvent): EnemyHealth | null {
    if (!HasTarget(event) || event.targetIsFriendly) {
      return null;
    }

    const targetId = event.targetID;
    let enemy = this.enemies[targetId];
    if (!enemy) {
      const baseInfo = this.owner.report.enemies.find(
        (enemy: { id: number }) => enemy.id === targetId,
      );
      if (!baseInfo) {
        debug && console.warn('Enemy not noteworthy enough:', targetId, event);
      } else {
        this.enemies[targetId] = enemy = new Enemy(this.owner, baseInfo);
      }
    }
    const targetString = encodeTargetString(event.targetID, event.targetInstance);

    return {
      enemy,
      ...this.enemyHealths[targetString],
    };
  }
}

export default EnemiesHealth;
