import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Events, { DamageEvent, EnergizeEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPECS from 'game/SPECS';
import ItemDamageDone from 'interface/ItemDamageDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatNumber, formatPercentage } from 'common/format';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const DEATH_STRIKE_RP = 40;
const DEATH_COIL_RP = 40;
const FROST_STRIKE_RP = 25;

class Superstrain extends Analyzer {

  rpGained: number = 0;
  rpWasted: number = 0;

  rpDamage: number = 0;
  rpSpenderUsed: number = 0;

  swarmingMistDamage: number = 0;

  constructor(options: Options) {
    super(options);

    const active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id)
    this.active = active
    if (!active) {
      return;
    }

    this.addEventListener(Events.energize, this._onSwarmingMistEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SWARMING_MIST_TICK), this._onSwarmingMistDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.DEATH_STRIKE, SPELLS.DEATH_COIL, SPELLS.FROST_STRIKE_MAIN_HAND_DAMAGE, SPELLS.FROST_STRIKE_OFF_HAND_DAMAGE]), this._rpSpender);
  }

  _onSwarmingMistDamage(event: DamageEvent) {
    this.swarmingMistDamage += event.amount + (event.absorb || 0);
  }

  _onSwarmingMistEnergize(event: EnergizeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id || event.ability.guid !== SPELLS.SWARMING_MIST_RUNIC_POWER_GAIN.id) {
      return;
    }

    this.rpGained += event.resourceChange;
    this.rpWasted += event.waste;
  }

  _rpSpender(event: DamageEvent) {
    this.rpDamage += event.amount + (event.absorb || 0);
    this.rpSpenderUsed += 1;
  }

  get rpSpenderAverageDamage() {
    return this.rpDamage / this.rpSpenderUsed;
  }

  get rpBonusDamage() {
    return this.rpSpenderAverageDamage * Math.floor(this.rpGained / this.rpSpenderCost);
  }

  get totalDamage() {
    return this.swarmingMistDamage + this.rpBonusDamage;
  }

  get rpSpenderCost() {
    if (this.selectedCombatant.spec === SPECS.BLOOD_DEATH_KNIGHT) {
      return DEATH_STRIKE_RP;
    }

    if (this.selectedCombatant.spec === SPECS.UNHOLY_DEATH_KNIGHT) {
      return DEATH_COIL_RP;
    }

    return FROST_STRIKE_RP;
  }

  get rpSpenderName() {
    if (this.selectedCombatant.spec === SPECS.BLOOD_DEATH_KNIGHT) {
      return SPELLS.DEATH_STRIKE.name
    }

    if (this.selectedCombatant.spec === SPECS.UNHOLY_DEATH_KNIGHT) {
      return SPELLS.DEATH_COIL.name
    }

    return SPELLS.FROST_STRIKE.name
  }

  get rpWastePercentage() {
    return this.rpWasted / this.rpGained
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
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Avoid being Runic Power capped at all times, you wasted {this.rpWasted} PR by being RP capped.</span>)
          .icon(SPELLS.SWARMING_MIST_TICK.icon)
          .actual(t({
      id: "deathknight.suggestions.swarmingmist.efficiency",
      message: `You wasted ${(formatPercentage(actual))}% of RP from ${SPELLS.SWARMING_MIST.name} by being RP capped.`
    }))
          .recommended(`${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
        tooltip={(
          <>
            <strong>Runic Power:</strong> {this.rpGained} RP gained ({this.rpWasted} wasted)<br />
            <strong>Runic Power Damage:</strong> {formatNumber(this.rpBonusDamage)} damage ({this.rpSpenderName} does an average of {formatNumber(this.rpSpenderAverageDamage)} damage)<br />
            <strong>Swarming Mist Damage:</strong> {formatNumber(this.swarmingMistDamage)} damage
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SWARMING_MIST}>
          <>
            <ItemDamageDone amount={this.totalDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default Superstrain;
