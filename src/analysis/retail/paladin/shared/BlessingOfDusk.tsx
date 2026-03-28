import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Blessing of Dusk
 * Damage taken reduced by up to 10%, increasing as your health decreases.
 * The reduction is linear.
 */
export default class BlessingOfDusk extends Analyzer {
  totalDamageReduced = 0;
  totalOriginalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLESSING_OF_DUSK_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event: DamageEvent) {
    if (event.unmitigatedAmount !== undefined) {
      const amountTaken = event.amount + (event.absorbed || 0);
      const original = event.unmitigatedAmount;
      this.totalOriginalDamage += original;
      this.totalDamageReduced += original - amountTaken;
    }
    // If unmitigatedAmount is missing, we cannot compute the reduction, so skip.
  }

  get averageReductionPct() {
    if (this.totalOriginalDamage === 0) return 0;
    return this.totalDamageReduced / this.totalOriginalDamage;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.DEFAULT}
      >
        <BoringSpellValueText spell={TALENTS.BLESSING_OF_DUSK_TALENT}>
          <div>
            {formatNumber(this.totalDamageReduced)} <small>damage reduced</small>
          </div>
          <div>
            {formatNumber(this.owner.getPerSecond(this.totalDamageReduced))} <small>DRPS</small>
          </div>
          <div>
            {formatPercentage(this.averageReductionPct)}% <small>average reduction</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
