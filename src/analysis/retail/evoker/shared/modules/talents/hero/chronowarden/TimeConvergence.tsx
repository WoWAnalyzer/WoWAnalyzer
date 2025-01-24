import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import { InformationIcon } from 'interface/icons';
import { formatPercentage } from 'common/format';
/**
 * Using certain abilities with a 45 second or longer base cooldown grants 5% Intellect for 15 sec. Essence abilities extend the duration by 1 sec.
 */
class TimeConvergence extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.TIME_CONVERGENCE_TALENT);
  }

  statistic() {
    const buffUptime =
      this.selectedCombatant.getBuffUptime(SPELLS.TIME_CONVERGENCE_BUFF.id) /
      this.owner.fightDuration;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.TIME_CONVERGENCE_TALENT}>
          <div>
            <InformationIcon /> {formatPercentage(buffUptime, 2)}%<small> buff uptime</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TimeConvergence;
