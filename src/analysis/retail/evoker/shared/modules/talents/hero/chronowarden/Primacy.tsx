import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import { HasteIcon, InformationIcon } from 'interface/icons';
import { formatPercentage } from 'common/format';
import { PRIMACY_HASTE_PER_STACK } from 'analysis/retail/evoker/shared/constants';
/**
 * Each Reverberations DoT/HoT applied grants 3% Haste for 8 seconds, stacking up to 3 times.
 */
class Primacy extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.PRIMACY_TALENT);
  }

  statistic() {
    const buffUptime =
      this.selectedCombatant.getBuffUptime(SPELLS.PRIMACY_BUFF.id) / this.owner.fightDuration;
    const stackBuffUptimes = this.selectedCombatant.getStackBuffUptimes(SPELLS.PRIMACY_BUFF.id);
    const weightedStackUptime = Object.values(stackBuffUptimes).reduce(
      (acc, val, idx) => acc + val * idx,
      0,
    );
    const hasteBuffPercentage =
      (PRIMACY_HASTE_PER_STACK * weightedStackUptime) / this.owner.fightDuration;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.PRIMACY_TALENT}>
          <div>
            <HasteIcon /> {hasteBuffPercentage.toFixed(2)}%<small> average Haste gained</small>
            <p></p>
            <InformationIcon /> {formatPercentage(buffUptime, 2)}%<small> buff uptime</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Primacy;
