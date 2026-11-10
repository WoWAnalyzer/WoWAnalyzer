import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { TrackedBuffEvent } from 'src/parser/core/Entity';
import { isMythicPlus } from 'src/common/isMythicPlus';

class UnstableAffliction extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get primaryTargetHistory(): TrackedBuffEvent[] {
    let bestEnemy = null;
    let bestUptime = 0;

    for (const enemy of Object.values(this.enemies.getEntities())) {
      const uptime = enemy.getBuffUptime(SPELLS.UNSTABLE_AFFLICTION.id, this.owner.playerId);
      if (uptime > bestUptime) {
        bestUptime = uptime;
        bestEnemy = enemy;
      }
    }

    if (!bestEnemy) {
      return [];
    }
    return bestEnemy.getBuffHistory(SPELLS.UNSTABLE_AFFLICTION.id, this.owner.playerId);
  }

  get bossHistories(): { name: string; history: TrackedBuffEvent[] }[] {
    if (isMythicPlus(this.owner.fight)) {
      return [];
    }
    return Object.values(this.enemies.getEntities())
      .filter((enemy) => enemy.subType === 'Boss')
      .map((enemy) => ({
        name: enemy.name,
        history: enemy.getBuffHistory(SPELLS.UNSTABLE_AFFLICTION.id, this.owner.playerId),
      }))
      .filter(({ history }) => history.length > 0);
  }

  maxObservedStacks(history: TrackedBuffEvent[]): number {
    const stacks = history.flatMap((debuff) => debuff.stackHistory.map((e) => e.stacks));
    return Math.max(1, ...stacks);
  }
}

export default UnstableAffliction;
