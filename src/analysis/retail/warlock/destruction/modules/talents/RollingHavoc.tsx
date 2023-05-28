import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

class RollingHavoc extends Analyzer {
  static talent = TALENTS.ROLLING_HAVOC_TALENT;
  static buffId = SPELLS.ROLLING_HAVOC_BUFF.id;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(RollingHavoc.talent);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(RollingHavoc.buffId) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={RollingHavoc.talent}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RollingHavoc;
