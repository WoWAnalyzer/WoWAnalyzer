import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Havoc extends Analyzer {
  get dps() {
    return (this.damage / this.owner.fightDuration) * 1000;
  }

  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  damage = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp)) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  // TODO: this could perhaps be reworked somehow to be more accurate but not sure how yet. Take it as a Havoc v1.0
  statistic() {
    if (this.damage === 0) {
      return null;
    }

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="small"
        tooltip={
          <>
            You cleaved {formatThousands(this.damage)} damage to targets afflicted by your Havoc.
            <br />
            <br />
            Note: This number is probably higher than it should be, as it also counts the damage you
            did directly to the Havoc target (not just the cleaved damage).
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.HAVOC.id}>
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Havoc;
