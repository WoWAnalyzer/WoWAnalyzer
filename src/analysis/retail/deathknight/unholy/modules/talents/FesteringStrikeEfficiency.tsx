import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HasTarget } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
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

  private totalFesteringStrikeCasts: number = 0;
  private festeringStrikeCastsOverSafeCount: number = 0;

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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are casting <SpellLink spell={TALENTS.FESTERING_STRIKE_TALENT} /> too often. When
          spending runes remember to cast <SpellLink spell={TALENTS.FESTERING_STRIKE_TALENT} />{' '}
          instead on targets with more than three stacks of{' '}
          <SpellLink spell={SPELLS.FESTERING_WOUND} />
        </>,
      )
        .icon(TALENTS.FESTERING_STRIKE_TALENT.icon)
        .actual(
          defineMessage({
            id: 'deathknight.unholy.suggestions.festeringStrikes.efficiency',
            message: `${formatPercentage(
              actual,
            )}% of Festering Strikes did not risk overcapping Festering Wounds`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
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
