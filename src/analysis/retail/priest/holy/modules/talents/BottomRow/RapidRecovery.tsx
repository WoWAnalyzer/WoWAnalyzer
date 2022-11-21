import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber, formatPercentage } from 'common/format';

const RAPID_RECOVERY_HEALING_INCREASE = 0.35;

/**
 * Increases healing done by Renew by 35%,
 * but decreases its base duration by 3 sec.
 */

class RapidRecovery extends Analyzer {
  rawAdditionalHealing: number = 0;
  effectiveAdditionalHealing: number = 0;
  overhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RAPID_RECOVERY_TALENT.id);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT),
      this.onRenewCast,
    );
  }

  get percentOverhealing() {
    if (this.rawAdditionalHealing === 0) {
      return 0;
    }
    return this.overhealing / this.rawAdditionalHealing;
  }

  onRenewCast(event: HealEvent) {
    // Casted a Holy word with at least one stack of Pontifex
    const rawHealAmount = event.amount * RAPID_RECOVERY_HEALING_INCREASE;
    const effectiveHealAmount = calculateEffectiveHealing(event, RAPID_RECOVERY_HEALING_INCREASE);
    const overHealAmount = calculateOverhealing(event, RAPID_RECOVERY_HEALING_INCREASE);

    this.rawAdditionalHealing += rawHealAmount;
    this.effectiveAdditionalHealing += effectiveHealAmount;
    this.overhealing += overHealAmount;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Total Healing: {formatNumber(this.rawAdditionalHealing)} (
            {formatPercentage(this.percentOverhealing)}% OH)
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.RAPID_RECOVERY_TALENT.id}>
          <ItemHealingDone amount={this.effectiveAdditionalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RapidRecovery;
