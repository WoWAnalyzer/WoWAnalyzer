import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

class ChaosTheory extends Analyzer {
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.CHAOS_THEORY_TALENT);
  }

  get buffUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.CHAOS_THEORY_BUFF.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.CHAOS_THEORY_TALENT}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>Buff uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ChaosTheory;
