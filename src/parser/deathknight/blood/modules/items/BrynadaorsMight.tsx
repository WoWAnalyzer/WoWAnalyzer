import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Events, { EnergizeEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class BrynadaorsMight extends Analyzer {

  runicPowerGained: number = 0;
  runicPowerWasted: number = 0;

  brynadaorsTriggered: number = 0;
  deathStriked: number = 0;

  constructor(options: Options) {
    super(options);

    const active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.BRYNDAORS_MIGHT.bonusID)
    this.active = active
    if (!active) {
      return;
    }

    this.addEventListener(Events.energize, this._onEnergize)
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DEATH_STRIKE_HEAL), this._onHeal)
  }

  _onEnergize(event: EnergizeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id || event.ability.guid !== SPELLS.BRYNDAORS_MIGHT_RUNIC_POWER_GAIN.id) {
      return;
    }

    this.runicPowerGained += event.resourceChange
    this.runicPowerWasted += event.waste
    this.brynadaorsTriggered += 1
  }

  _onHeal() {
    this.deathStriked += 1
  }

  get brynadaorsNotTriggered() {
    return this.deathStriked - this.brynadaorsTriggered
  }

  get brynadaorsPercentage() {
    return this.brynadaorsNotTriggered / this.deathStriked
  }

  get rpWastePercentage() {
    return this.runicPowerWasted / this.runicPowerGained
  }

  get efficiencySuggestionThresholds() {
    return {
      actual: this.rpWastePercentage,
      isGreaterThan: {
        minor: 0,
        average: .2,
        major: .4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.efficiencySuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Avoid being Runic Power capped at all times, you wasted {this.runicPowerWasted} PR by being RP capped.</span>)
          .icon(SPELLS.BRYNDAORS_MIGHT.icon)
          .actual(`You wasted ${(formatPercentage(actual))}% of RP from ${SPELLS.BRYNDAORS_MIGHT.name} by being RP capped.`)
          .recommended(`${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={(
          <>
            <strong>{this.brynadaorsTriggered}</strong> of your {SPELLS.DEATH_STRIKE.name}s triggered {SPELLS.BRYNDAORS_MIGHT.name} while <strong>{this.brynadaorsNotTriggered} ({formatPercentage(this.brynadaorsPercentage)}%) did not</strong>.<br />
            <strong>RP wasted: </strong> {this.runicPowerWasted} ({formatPercentage(this.rpWastePercentage)} %)
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.BRYNDAORS_MIGHT}>
          <>
            {this.runicPowerGained} <small>RP gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default BrynadaorsMight;
