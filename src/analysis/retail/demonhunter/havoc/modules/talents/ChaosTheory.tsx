import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class ChaosTheory extends Analyzer {
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.CHAOS_THEORY_TALENT.id);
  }

  get buffUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.CHAOS_THEORY_BUFF.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spellId={TALENTS_DEMON_HUNTER.CHAOS_THEORY_TALENT.id}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>Buff uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ChaosTheory;
