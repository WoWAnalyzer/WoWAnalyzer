import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { TrackedBuffEvent } from 'src/parser/core/Entity';

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

  get maxObservedStacks(): number {
    const stacks = this.primaryTargetHistory.flatMap((debuff) =>
      debuff.stackHistory.map((entry) => entry.stacks),
    );
    return Math.max(1, ...stacks);
  }
}

export default UnstableAffliction;
