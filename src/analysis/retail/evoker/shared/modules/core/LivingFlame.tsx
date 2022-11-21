import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

class LivingFlame extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  livingFlameHealing = 0;
  livingFlameDamage = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_HEAL),
      this.onHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.livingFlameDamage += event.amount;
  }

  onHeal(event: HealEvent) {
    this.livingFlameHealing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.LIVING_FLAME_DAMAGE.id}>
          <ItemHealingDone amount={this.livingFlameHealing} />
          <br />
          <ItemDamageDone amount={this.livingFlameDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LivingFlame;
