import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EnergizeEvent, HealEvent } from 'parser/core/Events';

import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';

class RelishInBlood extends Analyzer {

  runicPowerGained: number = 0;
  runicPowerWasted: number = 0;
  healing: number = 0;
  overhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RELISH_IN_BLOOD_TALENT.id);

    this.addEventListener(Events.energize.spell(SPELLS.RELISH_IN_BLOOD), this._relishBuffed)
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RELISH_IN_BLOOD), this._onHeal);
  }

  _relishBuffed(event: EnergizeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id) {
      return;
    }

    this.runicPowerGained += event.resourceChange
    this.runicPowerWasted += event.waste
  }

  _onHeal(event: HealEvent) {
    if (event.overheal) {
      this.overhealing += event.overheal
    }
    this.healing += event.amount + event.absorb
  }

  get overhealPercentage() {
    return this.overhealing / this.healing
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
          .icon(SPELLS.RELISH_IN_BLOOD_TALENT.icon)
          .actual(t({
      id: "deathknight.suggestions.hysteria.efficiency",
      message: `You wasted ${(formatPercentage(actual))}% of RP from ${SPELLS.RELISH_IN_BLOOD_TALENT.name} by being RP capped.`
    }))
          .recommended(`${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(
          <>
            <strong>RP wasted: </strong> {this.runicPowerWasted} ({formatPercentage(this.rpWastePercentage)} %)<br />
            <strong>Healing: </strong> {formatNumber(this.healing)} <br />
            <strong>Overhealing: </strong> {formatNumber(this.overhealing)} ({formatPercentage(this.overhealPercentage)} %) <br />
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.RELISH_IN_BLOOD_TALENT}>
          <>
            {this.runicPowerGained} <small>RP gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default RelishInBlood;
