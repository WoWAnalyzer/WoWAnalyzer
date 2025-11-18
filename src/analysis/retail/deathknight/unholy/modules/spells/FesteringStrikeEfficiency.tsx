import { formatPercentage } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HasTarget } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import WoundTracker from '../features/WoundTracker';
import { TALENTS_DEATH_KNIGHT } from 'common/TALENTS';
import TALENTS from 'common/TALENTS/deathknight';

const SAFE_WOUND_COUNT = 3;

class FesteringStrikeEfficiency extends Analyzer {
  static dependencies = {
    woundTracker: WoundTracker,
  };

  protected woundTracker!: WoundTracker;

  private totalFesteringStrikeCasts = 0;
  private festeringStrikeCastsOverSafeCount = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DEATH_KNIGHT.FESTERING_STRIKE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FESTERING_STRIKE_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.totalFesteringStrikeCasts += 1;
    if (!HasTarget(event)) {
      return;
    }
    const targetString = encodeTargetString(event.targetID, event.targetInstance);

    if (this.woundTracker.targets[targetString]) {
      const currentTargetWounds = this.woundTracker.targets[targetString];
      if (currentTargetWounds > SAFE_WOUND_COUNT) {
        this.festeringStrikeCastsOverSafeCount += 1;
      }
    }
  }

  get strikeEfficiency(): number {
    return 1 - this.festeringStrikeCastsOverSafeCount / this.totalFesteringStrikeCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.strikeEfficiency,
      isLessThan: {
        minor: 0.8,
        average: 0.7,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        tooltip={`${this.festeringStrikeCastsOverSafeCount} of out ${this.totalFesteringStrikeCasts} Festering Strikes were cast on a target with more than three stacks of Festering Wounds.`}
        position={STATISTIC_ORDER.CORE(4)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.FESTERING_STRIKE_TALENT}>
          <>
            {formatPercentage(this.strikeEfficiency)}% <small>efficiency</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FesteringStrikeEfficiency;
