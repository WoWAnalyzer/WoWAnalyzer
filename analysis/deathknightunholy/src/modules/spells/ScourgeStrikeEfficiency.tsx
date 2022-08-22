import { t, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
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

class ScourgeStrikeEfficiency extends Analyzer {
  static dependencies = {
    woundTracker: WoundTracker,
  };

  protected woundTracker!: WoundTracker;

  constructor(options: Options) {
    super(options);
    this.activeSpell = this.selectedCombatant.hasTalent(SPELLS.CLAWING_SHADOWS_TALENT.id)
      ? SPELLS.CLAWING_SHADOWS_TALENT
      : SPELLS.SCOURGE_STRIKE;

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.activeSpell), this.onCast);
  }

  activeSpell: Spell;
  totalCasts = 0;
  zeroWoundCasts = 0;

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
        <Trans id="deathknight.unholy.scourgeStrike.suggestion.suggestion">
          You are casting <SpellLink id={this.activeSpell.id} /> too often. When spending runes
          remember to cast <SpellLink id={this.activeSpell.id} /> instead on targets with no stacks
          of <SpellLink id={this.activeSpell.id} />
        </Trans>,
      )
        .icon(this.activeSpell.icon)
        .actual(
          t({
            id: 'deathknight.unholy.scourgeStrike.suggestion.actual',
            message: `${formatPercentage(actual)}% of ${
              this.activeSpell.name
            } were used with Wounds on the target`,
          }),
        )
        .recommended(
          t({
            id: 'deathknight.unholy.scourgeStrike.suggestion.recommended',
            message: `>${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        tooltip={t({
          id: 'deathknight.unholy.scourgeStrike.statistic.tooltip',
          message: `${this.zeroWoundCasts} out of ${this.totalCasts} ${this.activeSpell.name} were used with no Festering Wounds on the target.`,
        })}
        position={STATISTIC_ORDER.CORE(3)}
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
      >
        <BoringSpellValueText spellId={SPELLS.SCOURGE_STRIKE.id}>
          <Trans id="deathknight.unholy.scourgeStrike.statistic">
            {formatPercentage(this.strikeEfficiency)}% <small>efficiency</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ScourgeStrikeEfficiency;
