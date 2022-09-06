import { formatPercentage } from 'common/format';
import DH_LEGENDARIES from 'common/SPELLS/shadowlands/legendaries/demonhunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class ChaosTheory extends Analyzer {
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(DH_LEGENDARIES.CHAOS_THEORY);
    if (!this.active) {
      return;
    }
  }

  get buffUptime() {
    return (
      this.selectedCombatant.getBuffUptime(DH_LEGENDARIES.CHAOTIC_BLADES.id) /
      this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.ITEMS}>
        <BoringSpellValueText spellId={DH_LEGENDARIES.CHAOS_THEORY.id}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>Buff uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ChaosTheory;
