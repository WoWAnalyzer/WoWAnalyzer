import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

//WCL: https://www.warcraftlogs.com/reports/7DNACRhnaKzBfHLM/#fight=1&source=19
class FeastOfSouls extends Analyzer {
  heal = 0;
  overHeal = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FEAST_OF_SOULS_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FEAST_OF_SOULS_HEAL),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
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
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.FEAST_OF_SOULS_TALENT}>
          <ItemHealingDone amount={this.heal} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FeastOfSouls;
