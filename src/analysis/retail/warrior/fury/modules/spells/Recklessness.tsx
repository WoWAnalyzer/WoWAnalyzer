import { RAGE_SCALE_FACTOR } from 'analysis/retail/warrior/constants';
import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import { formatNumber, formatPercentage } from 'common/format';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import RageTracker from '../core/RageTracker';

class Recklessness extends Analyzer {
  static dependencies = {
    rageTracker: RageTracker,
  };

  protected rageTracker!: RageTracker;

  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.hasTalent(TALENTS.RECKLESSNESS_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.BERSERKERS_TORMENT_TALENT);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RECKLESSNESS.id) / this.owner.fightDuration;
  }

  get ratioReckRageGen() {
    return this.rageTracker.recklessGenerated / this.rageTracker.generated;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={
          <>
            {formatNumber(this.rageTracker.recklessGenerated * RAGE_SCALE_FACTOR)} extra rage
            generated
            <br />
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.RECKLESSNESS}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Recklessness;
