import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

const DAMAGE_BONUS = [
  0,
  0.09,
  0.1,
  0.11,
  0.12,
  0.13,
  0.14,
  0.15,
  0.16,
  0.17,
  0.18,
  0.19,
  0.2,
  0.21,
  0.22,
  0.23,
];

class MaimMangle extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  conduitRank: number = 0;
  bonusDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;
    this.conduitRank = 0;

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MUTILATE), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.GARROTE.id)) {
      this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS[this.conduitRank]);
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.MAIM_MANGLE.id}>
          <ItemDamageDone amount={this.bonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MaimMangle;
