import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import { IntellectIcon, InformationIcon } from 'interface/icons';
import { formatPercentage } from 'common/format';

class MomentumShift extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.MOMENTUM_SHIFT_TALENT);
  }

  statistic() {
    const buffUptime =
      this.selectedCombatant.getBuffUptime(SPELLS.MOMENTUM_SHIFT_BUFF.id) /
      this.owner.fightDuration;
    const stackBuffUptimes = this.selectedCombatant.getStackBuffUptimes(
      SPELLS.MOMENTUM_SHIFT_BUFF.id,
    );
    const intellectBuffPercentage =
      (5 * stackBuffUptimes[1] + 10 * stackBuffUptimes[2]) / this.owner.fightDuration;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.MOMENTUM_SHIFT_TALENT}>
          <div>
            <IntellectIcon /> {intellectBuffPercentage.toFixed(2)}%
            <small> average Intellect gained</small>
            <p></p>
            <InformationIcon /> {formatPercentage(buffUptime, 2)}%<small> buff uptime</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default MomentumShift;
