import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const MAX_STACKS = 30;

class JadeIgnition extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  totalStacks = 0;
  currentStacks = 0;
  stacksWasted = 0;

  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = false;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.JADE_IGNITION_BUFF),
      this.applyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.JADE_IGNITION_BUFF),
      this.applyBuffStack,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FISTS_OF_FURY_DAMAGE),
      this.onFistsDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK),
      this.castSpinningCraneKick,
    );
  }

  applyBuff() {
    this.currentStacks += 1;
  }

  applyBuffStack() {
    this.currentStacks += 1;
  }

  onFistsDamage() {
    this.totalStacks += 1;
    if (this.currentStacks === MAX_STACKS) {
      this.stacksWasted += 1;
    }
  }

  castSpinningCraneKick() {
    this.currentStacks = 0;
  }

  get damageDone() {
    return this.abilityTracker.getAbilityDamage(SPELLS.JADE_IGNITION_DAMAGE.id);
  }

  get stackUsage() {
    return 1 - this.stacksWasted / this.totalStacks;
  }

  get suggestionThresholds() {
    return {
      actual: this.stackUsage,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={TALENTS.JADE_IGNITION_TALENT}>
          <ItemDamageDone amount={this.damageDone} />
          <br />
          {formatPercentage(this.stackUsage, 0)}% <small>Stacks used</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="monk.windwalker.suggestions.jadeIgnitionWastedStacks">
          {' '}
          You wasted your <SpellLink spell={SPELLS.JADE_IGNITION_BUFF} /> stacks by using Fists of
          Fury at full stacks
        </Trans>,
      )
        .icon(TALENTS.JADE_IGNITION_TALENT.icon)
        .actual(`${formatPercentage(actual, 0)}% Stacks used`)
        .recommended(`${formatPercentage(recommended, 0)}% Stacks used is recommended`),
    );
  }
}

export default JadeIgnition;
