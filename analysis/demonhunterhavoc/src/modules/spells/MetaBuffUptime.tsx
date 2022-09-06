import { formatDuration, formatPercentage } from 'common/format';
import DH_SPELLS from 'common/SPELLS/demonhunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/*
example report: https://www.warcraftlogs.com/reports/KGJgZPxanBX82LzV/#fight=4&source=20
* */

class MetaBuffUptime extends Analyzer {
  get buffUptime() {
    return (
      this.selectedCombatant.getBuffUptime(DH_SPELLS.METAMORPHOSIS_HAVOC_BUFF.id) /
      this.owner.fightDuration
    );
  }

  get buffDuration() {
    return this.selectedCombatant.getBuffUptime(DH_SPELLS.METAMORPHOSIS_HAVOC_BUFF.id);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={`The Metamorphosis buff total uptime was ${formatDuration(this.buffDuration)}.`}
      >
        <BoringSpellValueText spellId={DH_SPELLS.METAMORPHOSIS_HAVOC_BUFF.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MetaBuffUptime;
