import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class PlagueBringer extends Analyzer {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PLAGUEBRINGER_TALENT);
    if (!this.active) {
      return;
    }
  }

  get averageBuffUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.PLAGUEBRINGER_BUFF.id) / this.owner.fightDuration
    );
  }

  get totalBuffUptime() {
    return Math.round(this.selectedCombatant.getBuffUptime(SPELLS.PLAGUEBRINGER_BUFF.id) / 1000);
  }

  statistic() {
    return (
      <Statistic
        tooltip={`Your Plaguebringer was up ${this.totalBuffUptime} out of ${Math.round(
          this.owner.fightDuration / 1000,
        )} seconds`}
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.PLAGUEBRINGER_TALENT}>
          <>
            {formatPercentage(this.averageBuffUptime)}% <small>Plaguebringer uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PlagueBringer;
