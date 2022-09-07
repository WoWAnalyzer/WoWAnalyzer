import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const debug = false;

class RuleOfThrees extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  barrageWithRuleOfThrees = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RULE_OF_THREES_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE),
      this.onBarrageCast,
    );
  }

  onBarrageCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RULE_OF_THREES_BUFF.id, event.timestamp + 1)) {
      debug && this.log('Arcane Barrage with Rule of Threes Buff');
      this.barrageWithRuleOfThrees += 1;
    }
  }

  get utilization() {
    return (
      1 -
      this.barrageWithRuleOfThrees / this.abilityTracker.getAbility(SPELLS.ARCANE_BARRAGE.id).casts
    );
  }

  get ruleOfThreesUtilizationThresholds() {
    return {
      actual: this.utilization,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.ruleOfThreesUtilizationThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={SPELLS.ARCANE_BARRAGE.id} /> {this.barrageWithRuleOfThrees} times
          while you had the <SpellLink id={SPELLS.RULE_OF_THREES_BUFF.id} /> buff. This buff makes
          your next <SpellLink id={SPELLS.ARCANE_BLAST.id} /> or{' '}
          <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> free after you gain your third Arcane Charge,
          so you should ensure that you use the buff before clearing your charges.
        </>,
      )
        .icon(SPELLS.RULE_OF_THREES_TALENT.icon)
        .actual(
          <Trans id="mage.arcane.suggestions.ruleOfThrees.utilization">
            {formatPercentage(this.utilization)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default RuleOfThrees;
