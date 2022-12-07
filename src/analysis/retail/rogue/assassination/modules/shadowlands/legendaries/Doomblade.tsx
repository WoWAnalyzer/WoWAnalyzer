import { ASSASSINATION_BLEED_DEBUFFS } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Doomblade extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  bonusEnvenomDamage = 0;
  mutilatedFleshDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MUTILATED_FLESH),
      this.onMutilatedFleshDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ENVENOM),
      this.onEnvenomDamage,
    );
  }

  onMutilatedFleshDamage(event: DamageEvent) {
    this.mutilatedFleshDamage += event.amount;
  }

  onEnvenomDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (
      !enemy ||
      (enemy &&
        !ASSASSINATION_BLEED_DEBUFFS.some((effect) => enemy.hasBuff(effect.id, event.timestamp)))
    ) {
      return;
    }
    let enemyBleedCount = 0;
    ASSASSINATION_BLEED_DEBUFFS.forEach((debuff) => {
      if (enemy.hasBuff(debuff.id, event.timestamp)) {
        enemyBleedCount += 1;
      }
    });
    this.bonusEnvenomDamage += calculateEffectiveDamage(event, 0.05 * enemyBleedCount);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.DOOMBLADE.id}>
          <ItemDamageDone amount={this.mutilatedFleshDamage} />
        </BoringSpellValueText>
        <BoringSpellValueText spellId={SPELLS.ENVENOM.id}>
          <ItemDamageDone amount={this.bonusEnvenomDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Doomblade;
