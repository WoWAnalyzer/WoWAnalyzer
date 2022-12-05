import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';

class LivingFlame extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  livingFlameHealing: number = 0;
  livingFlameDamage: number = 0;
  numCasts: number = 0;

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
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_CAST),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.numCasts += 1;
  }

  onDamage(event: DamageEvent) {
    this.livingFlameDamage += event.amount;
  }

  onHeal(event: HealEvent) {
    this.livingFlameHealing += event.amount + (event.absorbed || 0);
  }
}

export default LivingFlame;
