import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import Events from 'parser/core/Events';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const OSSUARY_RUNICPOWER_REDUCTION = 5;

class Ossuary extends Analyzer {
  dsWithOS = 0;
  dsWithoutOS = 0;

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.OSSUARY.id) / this.owner.fightDuration;
  }

  get buffedDeathStrikes() {
    return this.dsWithOS / (this.dsWithOS + this.dsWithoutOS);
  }

  constructor(options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEATH_STRIKE), this.onCast);
  }

  onCast(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.OSSUARY.id)) {
      this.dsWithOS += 1;
    } else {
      this.dsWithoutOS += 1;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `This Death Strike cast was without Ossuary.`;
    }
  }

  get efficiencySuggestionThresholds() {
    return {
      actual: this.buffedDeathStrikes,
      isLessThan: {
        minor: 1,
        average: 0.9,
        major: .85,
      },
      style: 'percentage',
    };
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.efficiencySuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest('Your Ossuary usage can be improved. Avoid casting Death Strike while not having Ossuary up as you lose Runic Power by doing so.')
        .icon(SPELLS.OSSUARY.icon)
        .actual(i18n._(t('deathknight.blood.suggestions.ossuary.efficiency')`${formatPercentage(actual)}% Ossuary efficiency`))
        .recommended(`${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={(
          <>
            {this.dsWithoutOS * OSSUARY_RUNICPOWER_REDUCTION} RP wasted by casting them without Ossuary up.<br />
            {this.dsWithOS * OSSUARY_RUNICPOWER_REDUCTION} RP saved by casting them with Ossuary up.<br />
            {formatPercentage(this.uptime)}% uptime.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.OSSUARY}>
          <>
            {this.dsWithoutOS} / {this.dsWithOS + this.dsWithoutOS} <small>Death Strikes without Ossuary</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Ossuary;
