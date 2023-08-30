import { RAGE_SCALE_FACTOR } from 'analysis/retail/warrior/constants';
import calculateResourceIncrease from 'analysis/retail/warrior/shared/calculateResourceIncrease';
import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import { formatNumber, formatPercentage } from 'common/format';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import RageTracker from '../core/RageTracker';

export const RECKLESSNESS_INCREASE = 1;

class Recklessness extends Analyzer {
  static dependencies = {
    rageTracker: RageTracker,
  };

  protected rageTracker!: RageTracker;

  recklessnessRageGenerated = 0;

  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.hasTalent(TALENTS.RECKLESSNESS_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.BERSERKERS_TORMENT_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.onResourceChange);
  }

  onResourceChange(event: ResourceChangeEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RECKLESSNESS.id)) {
      const { bonus } = calculateResourceIncrease(event, RECKLESSNESS_INCREASE);

      this.recklessnessRageGenerated += (bonus.gain + bonus.waste) * RAGE_SCALE_FACTOR;
    }
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RECKLESSNESS.id) / this.owner.fightDuration;
  }

  get ratioReckRageGen() {
    return this.recklessnessRageGenerated / (this.rageTracker.generated + this.rageTracker.wasted);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={
          <>
            {formatNumber(this.recklessnessRageGenerated)} (
            {formatPercentage(this.ratioReckRageGen, 0)}%) extra rage generated
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
