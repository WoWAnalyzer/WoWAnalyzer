import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import TalentSpellText from 'parser/ui/TalentSpellText';

/*
example report: https://www.warcraftlogs.com/reports/wRG4vfCyMQVn9A6x#fight=8&type=summary&source=28
* */

export default class FuriousGaze extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FURIOUS_GAZE_TALENT);
  }

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
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.FURIOUS_GAZE_TALENT}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}
