import { formatPercentage, formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/deathknight';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import RunicPowerTracker from '../runicpower/RunicPowerTracker';

class RedThirst extends Analyzer {
  static dependencies = {
    runicPowerTracker: RunicPowerTracker,
  };

  protected runicPowerTracker!: RunicPowerTracker;

  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RED_THIRST_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.VAMPIRIC_BLOOD_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }

  get reduction() {
    return this.runicPowerTracker.cooldownReduction / 1000;
  }

  get wastedReduction() {
    return this.runicPowerTracker.cooldownReductionWasted / 1000;
  }

  get averageReduction() {
    return this.reduction / this.casts || 0;
  }

  get wastedPercent() {
    return this.wastedReduction / (this.wastedReduction + this.reduction);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatNumber(this.reduction)} sec total effective reduction and{' '}
            {formatNumber(this.wastedReduction)} sec ({formatPercentage(this.wastedPercent)}%)
            wasted reduction.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.RED_THIRST_TALENT}>
          <>
            <UptimeIcon /> {formatNumber(this.averageReduction)} sec{' '}
            <small>average reduction</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RedThirst;
