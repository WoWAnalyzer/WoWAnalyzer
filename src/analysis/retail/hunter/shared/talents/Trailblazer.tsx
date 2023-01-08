import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Trailblazer increases your movement speed by 30% whenever you have not
 * attacked for 3 seconds.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/1YZkWvbFGNgTA7L4#fight=3&type=summary&source=97
 */
class Trailblazer extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TRAILBLAZER_TALENT);
  }

  get percentUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.TRAILBLAZER_BUFF.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS.TRAILBLAZER_TALENT.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.percentUptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Trailblazer;
