import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import AverageTargetsHit from 'parser/ui/AverageTargetsHit';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Cost: 20 focus, 40 yd range. 30 Second cooldown.
 * Fires an explosive shot at your target. After 3 sec, the shot will explode, dealing (291% of Attack power) Fire damage to all enemies within 8 yds. Deals reduced damage beyond 5 targets.
 *
 * Existing Explosive Shot explodes on the target if a new application occurs.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Rn9XxCYLm1q7KFNW#fight=3&type=damage-done&source=15&ability=212680
 */

class ExplosiveShot extends Analyzer {
  hits = 0;
  damage = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EXPLOSIVE_SHOT_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EXPLOSIVE_SHOT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EXPLOSIVE_SHOT_DAMAGE),
      this.onDamage,
    );
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.hits += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.EXPLOSIVE_SHOT_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} unique />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ExplosiveShot;
