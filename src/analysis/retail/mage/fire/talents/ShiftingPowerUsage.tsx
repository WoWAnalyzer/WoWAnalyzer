import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class ShiftingPowerUsage extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  badUses = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHIFTING_POWER_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (!this.spellUsable.isOnCooldown(TALENTS.COMBUSTION_TALENT.id)) {
      this.badUses += 1;
    }
  }

  get percentUsage() {
    return (
      1 - this.badUses / this.abilityTracker.getAbility(TALENTS.SHIFTING_POWER_TALENT.id).casts
    );
  }

  get shiftingPowerUsageThresholds() {
    return {
      actual: this.percentUsage,
      isLessThan: {
        average: 1,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.shiftingPowerUsageThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You used <SpellLink id={TALENTS.SHIFTING_POWER_TALENT.id} /> while some critical abilities
          (
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> was not on cooldown. Since{' '}
          <SpellLink id={TALENTS.SHIFTING_POWER_TALENT.id} /> will reduce the cooldown on these
          spells by a decent amount, you want to ensure that you do not cast it unless both{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> is on cooldown.
        </>,
      )
        .icon(TALENTS.SHIFTING_POWER_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.shiftingPowerUsage.usagePercent">
            {formatPercentage(actual)}% utilization
          </Trans>,
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default ShiftingPowerUsage;
