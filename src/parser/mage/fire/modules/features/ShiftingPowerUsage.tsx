import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { formatPercentage } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import COVENANTS from 'game/shadowlands/COVENANTS';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { Trans } from '@lingui/macro';

class ShiftingPowerUsage extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  }
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  badUses = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasCovenant(COVENANTS.NIGHT_FAE.id) && this.selectedCombatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_POWER), this.onCast);
  }

  onCast(event: CastEvent) {
    if (!this.spellUsable.isOnCooldown(SPELLS.COMBUSTION.id) || !this.spellUsable.isOnCooldown(SPELLS.RUNE_OF_POWER_TALENT.id)) {
      this.badUses += 1;
    }
  }

  get percentUsage() {
    return this.badUses / this.abilityTracker.getAbility(SPELLS.SHIFTING_POWER.id).casts;
  }

  get shiftingPowerUsageThresholds() {
    return {
      actual: this.percentUsage,
      isLessThan: {
        average: 1,
        major: .8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.shiftingPowerUsageThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You used <SpellLink id={SPELLS.SHIFTING_POWER.id} /> while some critical abilities (<SpellLink id={SPELLS.COMBUSTION.id} /> and <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} />) were not on cooldown. Since <SpellLink id={SPELLS.SHIFTING_POWER.id} /> will reduce the cooldown on these spells by a decent amount, you want to ensure that you do not cast it unless both <SpellLink id={SPELLS.COMBUSTION.id} /> and <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> are on cooldown.</>)
          .icon(SPELLS.SHIFTING_POWER.icon)
          .actual(<Trans id="mage.fire.suggestions.shiftingPowerUsage.usagePercent">{formatPercentage(actual)}% utilization</Trans>)
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  
}

export default ShiftingPowerUsage;
