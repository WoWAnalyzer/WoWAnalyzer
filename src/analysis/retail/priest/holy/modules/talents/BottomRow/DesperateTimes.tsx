import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/priest';
import Events, { HealEvent } from 'parser/core/Events';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';

const HEALING_MULTIPLIER_PER_RANK = 0.1;
//Example log: /report/kVQd4LrBb9RW2h6K/9-Heroic+The+Primal+Council+-+Wipe+5+(5:04)/Delipriest/standard/statistics
class DesperateTimes extends Analyzer {
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;
  healingMultiplier = 0;

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS.DESPERATE_TIMES_TALENT)) {
      this.active = false;
    }
    this.healingMultiplier =
      HEALING_MULTIPLIER_PER_RANK *
      this.selectedCombatant.getTalentRank(TALENTS.DESPERATE_TIMES_TALENT);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }
  onHeal(event: HealEvent) {
    const lifeBeforeHeal = event.hitPoints - event.amount;
    const lifePercentageBeforeHeal = lifeBeforeHeal / event.maxHitPoints;
    if (lifePercentageBeforeHeal <= 0.5) {
      //Float imprecision should not matter here

      this.healingDoneFromTalent += calculateEffectiveHealing(event, this.healingMultiplier);
      this.overhealingDoneFromTalent += calculateOverhealing(event, this.healingMultiplier);
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Total Healing:{' '}
            {formatNumber(this.healingDoneFromTalent + this.overhealingDoneFromTalent)} (
            {formatPercentage(
              this.overhealingDoneFromTalent /
                (this.healingDoneFromTalent + this.overhealingDoneFromTalent),
            )}
            % OH)
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <TalentSpellText talent={TALENTS.DESPERATE_TIMES_TALENT}>
          <ItemHealingDone amount={this.healingDoneFromTalent} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
export default DesperateTimes;
