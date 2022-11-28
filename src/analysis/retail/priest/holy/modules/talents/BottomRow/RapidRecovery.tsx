import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Renew from '../../spells/Renew';

const RAPID_RECOVERY_HEALING_INCREASE = 0.35;

/**
 * Increases healing done by Renew by 35%,
 * but decreases its base duration by 3 sec.
 */
class RapidRecovery extends Analyzer {
  static dependencies = {
    renew: Renew,
  };

  protected renew!: Renew;

  additionalHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RAPID_RECOVERY_TALENT.id);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT),
      this.onRenewTick,
    );
  }

  get averageRenewTick() {
    return this.renew.averageHealingPerTick + this.renew.averageAbsorptionPerTick;
  }

  get ticksLost() {
    return this.renew.rapidRecoveryTicksLost;
  }

  get effectiveAdditionalHealing() {
    return this.additionalHealing - this.ticksLost * this.averageRenewTick;
  }

  onRenewTick(event: HealEvent) {
    this.additionalHealing += calculateEffectiveHealing(event, RAPID_RECOVERY_HEALING_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<>{this.ticksLost.toFixed(1)} ticks of renew lost to duration decrease.</>}
      >
        <BoringSpellValueText spellId={TALENTS.RAPID_RECOVERY_TALENT.id}>
          <ItemHealingDone amount={this.effectiveAdditionalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RapidRecovery;
