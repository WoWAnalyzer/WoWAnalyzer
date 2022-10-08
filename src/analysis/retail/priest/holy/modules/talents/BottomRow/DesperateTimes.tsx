import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/priest';
import Events, { HealEvent } from 'parser/core/Events';
import TalentSpellText from 'parser/ui/TalentSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

class DesperateTimes extends Analyzer {
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;
  healingMultiplier = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DESPERATE_TIMES_TALENT);
    this.healingMultiplier =
      0.1 * this.selectedCombatant.getTalentRank(TALENTS.DESPERATE_TIMES_TALENT);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }
  onHeal(event: HealEvent) {
    const lifeBeforeHeal = event.hitPoints - event.amount;
    const lifePercentageBeforeHeal = lifeBeforeHeal / event.maxHitPoints;
    if (lifePercentageBeforeHeal <= 0.5) {
      //Float imprecision should not matter here
      const overhealing = event.overheal != null ? event.overheal : 0;
      const absorbed = event.absorbed != null ? event.absorbed : 0;
      const totalHealing = event.amount + overhealing + absorbed;
      const totalhealingFromTalent = totalHealing - totalHealing / (1 + this.healingMultiplier);
      this.overhealingDoneFromTalent +=
        overhealing <= totalhealingFromTalent ? overhealing : totalhealingFromTalent;
      this.healingDoneFromTalent += Math.max(totalhealingFromTalent - overhealing, 0);
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
        <TalentSpellText
          spellId={TALENTS.DESPERATE_TIMES_TALENT.id}
          maxRanks={TALENTS.DESPERATE_TIMES_TALENT.maxRanks}
        >
          <ItemHealingDone amount={this.healingDoneFromTalent} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
export default DesperateTimes;
