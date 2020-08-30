import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellLink from 'common/SpellLink';

import { formatPercentage } from 'common/format';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';

import Voidform from './Voidform';

const DISPERSION_BASE_CD = 90;
const DISPERSION_UPTIME_MS = 6000;

class Disperion extends Analyzer {
  static dependencies = {
    voidform: Voidform,
  };
  protected voidform!: Voidform;

  _dispersions: any = {};
  _previousDispersionCast: any;

  get dispersions() {
    return Object.keys(this._dispersions).map(key => this._dispersions[key]);
  }

  startDispersion(event: any) {
    this._dispersions[event.timestamp] = {
      start: event.timestamp,
    };

    this._previousDispersionCast = event;
  }

  endDispersion(event: any) {
    this._dispersions[this._previousDispersionCast.timestamp] = {
      ...this._dispersions[this._previousDispersionCast.timestamp],
      end: event.timestamp,
    };

    if(this.voidform.inVoidform){
      this.voidform.addVoidformEvent(SPELLS.DISPERSION.id, {
        start: this.voidform.normalizeTimestamp({timestamp: this._previousDispersionCast.timestamp}),
        end: this.voidform.normalizeTimestamp(event),
      });
    }

    this._previousDispersionCast = null;
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DISPERSION.id) this.startDispersion(event);
  }

  on_byPlayer_removebuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DISPERSION.id) this.endDispersion(event);
  }

  suggestions(when: any) {
    const dispersionUptime = this.selectedCombatant.getBuffUptime(SPELLS.DISPERSION.id);
    const maxDispersionTime = Math.floor(calculateMaxCasts(DISPERSION_BASE_CD, this.owner.fightDuration)) * DISPERSION_UPTIME_MS;
    const dispersedTime = dispersionUptime / maxDispersionTime;


    when(dispersedTime).isGreaterThan(0.20)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<span>You spent {Math.round(dispersionUptime / 1000)} seconds (out of a possible {Math.round(maxDispersionTime / 1000)} seconds) in <SpellLink id={SPELLS.DISPERSION.id} />. Consider using <SpellLink id={SPELLS.DISPERSION.id} /> less or cancel it early.</span>)
          .icon(SPELLS.DISPERSION.icon)
          .actual(`${formatPercentage(actual)}% Dispersion uptime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended, unless the encounter requires it.`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
  }
}

export default Disperion;
