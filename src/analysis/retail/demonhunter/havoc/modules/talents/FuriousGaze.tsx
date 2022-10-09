import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/*
example report: https://www.warcraftlogs.com/reports/wRG4vfCyMQVn9A6x#fight=8&type=summary&source=28
* */

export default class FuriousGaze extends Analyzer {
  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FURIOUS_GAZE.id) / this.owner.fightDuration;
  }

  get buffDuration() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FURIOUS_GAZE.id);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`The Furious Gaze buff total uptime was ${formatDuration(this.buffDuration)}.`}
      >
        <BoringSpellValueText spellId={SPELLS.FURIOUS_GAZE.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
