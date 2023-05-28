import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class ReverseEntropy extends Analyzer {
  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.REVERSE_ENTROPY_BUFF.id) /
      this.owner.fightDuration
    );
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.REVERSE_ENTROPY_TALENT);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="small">
        <BoringSpellValueText spellId={TALENTS.REVERSE_ENTROPY_TALENT.id}>
          <UptimeIcon /> {formatPercentage(this.uptime, 0)} % <small>uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ReverseEntropy;
