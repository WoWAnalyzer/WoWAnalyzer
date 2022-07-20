import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

//WCL: https://www.warcraftlogs.com/reports/7DNACRhnaKzBfHLM/#fight=1&source=19
class FeastOfSouls extends Analyzer {
  heal = 0;
  overHeal = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FEAST_OF_SOULS_TALENT.id);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FEAST_OF_SOULS_HEAL),
      this.onHeal,
    );
  }

  onHeal(event) {
    this.heal += event.amount;
    this.overHeal += event.overheal || 0;
  }

  statistic() {
    const overHealPercent = this.overHeal / (this.overHeal + this.heal);
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(8)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            This shows the extra hps that the talent provides.
            <br />
            <strong>Effective healing:</strong> {formatNumber(this.heal)}
            <br />
            <strong>Overhealing:</strong> {formatNumber(this.overHeal)} |{' '}
            {formatPercentage(overHealPercent)}%
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.FEAST_OF_SOULS_TALENT.id}>
          <ItemHealingDone amount={this.heal} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FeastOfSouls;
