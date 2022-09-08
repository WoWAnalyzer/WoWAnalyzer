import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { CHAOS_THEORY_HAVOC_TALENT } from 'common/TALENTS/demonhunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class ChaosTheory extends Analyzer {
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(CHAOS_THEORY_HAVOC_TALENT);
    if (!this.active) {
      return;
    }
  }

  get buffUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.CHAOTIC_BLADES.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spellId={CHAOS_THEORY_HAVOC_TALENT.id}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>Buff uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ChaosTheory;
