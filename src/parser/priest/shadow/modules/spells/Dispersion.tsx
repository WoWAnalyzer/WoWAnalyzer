import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellLink from 'common/SpellLink';

import { formatPercentage } from 'common/format';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import { DISPERSION_BASE_CD, DISPERSION_UPTIME_MS } from '../../constants';

class Disperion extends Analyzer {
  _dispersions: any = {};
  _previousDispersionCast: any;
  dispersionUptime: number = 0;
  maxDispersionTime: number = 0;
  dispersedTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DISPERSION), this.onBuffApplied);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DISPERSION), this.onBuffRemoved);
  }

  get dispersions() {
    return Object.keys(this._dispersions).map(key => this._dispersions[key]);
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this._dispersions[event.timestamp] = {
      start: event.timestamp,
    };

    this._previousDispersionCast = event;
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    this._dispersions[this._previousDispersionCast.timestamp] = {
      ...this._dispersions[this._previousDispersionCast.timestamp],
      end: event.timestamp,
    };

    this._previousDispersionCast = null;
  }

  get suggestionThresholds() {
    this.dispersionUptime = this.selectedCombatant.getBuffUptime(SPELLS.DISPERSION.id);
    this.maxDispersionTime = Math.floor(calculateMaxCasts(DISPERSION_BASE_CD, this.owner.fightDuration)) * DISPERSION_UPTIME_MS;
    this.dispersedTime = this.dispersionUptime / this.maxDispersionTime;
    return {
      actual: this.dispersedTime,
      isGreaterThan: {
        minor: 0.5,
        average: 0.65,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }


  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You spent {Math.round(this.dispersionUptime / 1000)} seconds (out of a possible {Math.round(this.maxDispersionTime / 1000)} seconds) in <SpellLink id={SPELLS.DISPERSION.id} />. Consider using <SpellLink id={SPELLS.DISPERSION.id} /> less or cancel it early.</span>)
          .icon(SPELLS.DISPERSION.icon)
          .actual(i18n._(t('priest.shadow.suggestions.dispersion.uptime')`${formatPercentage(actual)}% Dispersion uptime`))
          .recommended(`<${formatPercentage(recommended)}% is recommended, unless the encounter requires it.`));
  }
}

export default Disperion;
