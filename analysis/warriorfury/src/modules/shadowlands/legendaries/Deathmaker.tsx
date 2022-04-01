import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const SIEGEBREAKER_DAMAGE_MODIFIER = 0.15;

class Deathmaker extends Analyzer {
  static depedencies = {
    enemies: Enemies,
  };
  damage: number = 0;
  siegeCasted: boolean = false;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.DEATHMAKER);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SIEGEBREAKER_TALENT),
      this.siegeTurnOn,
    );
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get dpsValue() {
    return this.damage / (this.owner.fightDuration / 1000);
  }

  siegeTurnOn() {
    this.siegeCasted = true;
  }

  onPlayerDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.SIEGEBREAKER_DEBUFF.id) && !this.siegeCasted) {
      this.damage += calculateEffectiveDamage(event, SIEGEBREAKER_DAMAGE_MODIFIER);
    } else {
      this.siegeCasted = false;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            <strong>
              {formatThousands(this.damage)} ({formatPercentage(this.damagePercent)}%)
            </strong>{' '}
            of your damage can be attributed to Siegebreaker's damage bonus.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.DEATHMAKER.id}>
          <>{formatThousands(this.dpsValue)} DPS</>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Deathmaker;
