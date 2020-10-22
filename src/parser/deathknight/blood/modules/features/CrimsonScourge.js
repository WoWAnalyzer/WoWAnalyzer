import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import Events from 'parser/core/Events';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const DURATION_WORTH_CASTING_MS = 8000;

class CrimsonScourge extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  crimsonScourgeProcsCounter = 0;
  freeDeathAndDecayCounter = 0;
  endOfCombatCast = false;

  constructor(options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_DECAY), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CRIMSON_SCOURGE), this.onApplyBuff);
  }

  onCast(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.CRIMSON_SCOURGE.id, event.timestamp)) {
      this.freeDeathAndDecayCounter += 1;
      if (this.endOfCombatCast) {
        this.endOfCombatCast = false;
      }
    }
  }

  onApplyBuff(event) {
    this.crimsonScourgeProcsCounter += 1;
    if (this.spellUsable.isOnCooldown(SPELLS.DEATH_AND_DECAY.id)) {
      this.spellUsable.endCooldown(SPELLS.DEATH_AND_DECAY.id);
    }
    if (event.timestamp + DURATION_WORTH_CASTING_MS > this.owner.fight.end_time) {
      this.endOfCombatCast = true;
    }
  }

  get wastedCrimsonScourgeProcs() {
    const wastedProcs = this.crimsonScourgeProcsCounter - this.freeDeathAndDecayCounter;
    if (this.endOfCombatCast) {
      return wastedProcs - 1;
    }
    return wastedProcs;
  }

  get wastedCrimsonScourgeProcsPercent() {
    return this.wastedCrimsonScourgeProcs / this.crimsonScourgeProcsCounter;
  }

  get efficiencySuggestionThresholds() {
    return {
      actual: 1 - this.wastedCrimsonScourgeProcsPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedCrimsonScourgeProcsPercent,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    if(this.selectedCombatant.hasTalent(SPELLS.RAPID_DECOMPOSITION_TALENT.id)){
      return;
    }
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You had unspent <SpellLink id={SPELLS.CRIMSON_SCOURGE.id} /> procs. Make sure you always use them.</>)
        .icon(SPELLS.CRIMSON_SCOURGE.icon)
        .actual(i18n._(t('deathknight.blood.suggestions.crimsonScourge.procsWasted')`${formatPercentage(actual)}% Crimson Scourge procs wasted`))
        .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        tooltip={`${this.wastedCrimsonScourgeProcs} out of ${this.crimsonScourgeProcsCounter} procs wasted.`}
      >
        <BoringSpellValueText spell={SPELLS.CRIMSON_SCOURGE}>
          <>
            {formatPercentage(this.wastedCrimsonScourgeProcsPercent)} % <small>procs wasted</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CrimsonScourge;
