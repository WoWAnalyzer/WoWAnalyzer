import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Renew from '../../spells/Renew';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';

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
    this.active = this.selectedCombatant.hasTalent(TALENTS.RAPID_RECOVERY_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RENEW_TALENT),
      this.onRenewTick,
    );
  }

  get averageRenewTickPreBuff() {
    const totalRenewHealing = this.renew.totalRenewHealing + this.renew.totalRenewAbsorbs;
    const healingPerTick = totalRenewHealing / this.renew.totalRenewTicks;
    // divide average healing per tick by RR increase to find average expected tick without buff
    return healingPerTick / (1 + RAPID_RECOVERY_HEALING_INCREASE);
  }

  get ticksLost() {
    return this.renew.rapidRecoveryTicksLost;
  }

  get effectiveAdditionalHealing() {
    // effective additional healing will be
    // healing increased from RR buff minus the amount of healing from unbuffed lost ticks
    return this.additionalHealing - this.ticksLost * this.averageRenewTickPreBuff;
  }

  onRenewTick(event: HealEvent) {
    this.additionalHealing += calculateEffectiveHealing(event, RAPID_RECOVERY_HEALING_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {this.ticksLost.toFixed(1)} ticks of <SpellLink spell={TALENTS.RENEW_TALENT} /> lost to
            duration decrease.
            <br />
            This number is estimated by using the player's haste value at time of renew application.
          </>
        }
      >
        <TalentSpellText talent={TALENTS.RAPID_RECOVERY_TALENT}>
          ~ <ItemHealingDone amount={this.effectiveAdditionalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RapidRecovery;
