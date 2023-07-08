import { formatPercentage, formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: https://www.warcraftlogs.com/reports/awmQnfCHrBRY8PAp#fight=53&type=healing&source=79
class BindingHeals extends Analyzer {
  occured = 0;
  selfHealing = 0;
  selfOverhealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.BINDING_HEALS_TALENT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.BINDING_HEALS_TALENT_HEAL),
      this.onHeal,
    );
  }

  getOverhealPercent(healingDone: number, overhealingDone: number) {
    const percent = overhealingDone / (healingDone + overhealingDone);
    return percent;
  }

  onHeal(event: HealEvent) {
    this.occured += 1;
    this.selfHealing += event.amount;

    if (event.overheal) {
      this.selfOverhealing += event.overheal;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Hits: {this.occured}
            <br />
            Healing: {formatThousands(this.selfHealing)} (
            {formatPercentage(this.getOverhealPercent(this.selfHealing, this.selfOverhealing))}% OH)
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(5)}
      >
        <BoringSpellValueText spell={TALENTS.BINDING_HEALS_TALENT}>
          <ItemHealingDone amount={this.selfHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default BindingHeals;
