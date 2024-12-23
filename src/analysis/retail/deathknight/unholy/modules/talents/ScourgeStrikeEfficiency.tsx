import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/deathknight';
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
import { Talent } from 'common/TALENTS/types';

class ScourgeStrikeEfficiency extends Analyzer {
  static dependencies = {
    woundTracker: WoundTracker,
  };

  protected woundTracker!: WoundTracker;

  private readonly activeSpell: Talent;
  private totalCasts: number = 0;
  private zeroWoundCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.activeSpell = this.selectedCombatant.hasTalent(TALENTS.CLAWING_SHADOWS_TALENT)
      ? TALENTS.CLAWING_SHADOWS_TALENT
      : TALENTS.SCOURGE_STRIKE_TALENT;

    this.active = this.selectedCombatant.hasTalent(this.activeSpell);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.activeSpell), this.onCast);
  }

  onCast(event: CastEvent) {
    if (!HasTarget(event)) {
      return;
    }
    this.totalCasts += 1;
    const targetString = encodeTargetString(event.targetID, event.targetInstance);

    if (this.woundTracker.targets[targetString]) {
      const currentTargetWounds = this.woundTracker.targets[targetString];
      if (currentTargetWounds < 1) {
        this.zeroWoundCasts += 1;
      }
    } else {
      this.zeroWoundCasts += 1;
    }
  }

  get strikeEfficiency() {
    return 1 - this.zeroWoundCasts / this.totalCasts;
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
          You are casting <SpellLink spell={this.activeSpell} /> too often. When spending runes
          remember to cast <SpellLink spell={this.activeSpell} /> instead on targets with no stacks
          of <SpellLink spell={this.activeSpell} />
        </>,
      )
        .icon(this.activeSpell.icon)
        .actual(
          defineMessage({
            id: 'deathknight.unholy.suggestions.scourgeStrike.efficiency',
            message: `${formatPercentage(actual)}% of ${
              this.activeSpell.name
            } were used with Wounds on the target`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        tooltip={`${this.zeroWoundCasts} out of ${this.totalCasts} ${this.activeSpell.name} were used with no Festering Wounds on the target.`}
        position={STATISTIC_ORDER.CORE(3)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={this.activeSpell}>
          <>
            {formatPercentage(this.strikeEfficiency)}% <small>efficiency</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ScourgeStrikeEfficiency;
