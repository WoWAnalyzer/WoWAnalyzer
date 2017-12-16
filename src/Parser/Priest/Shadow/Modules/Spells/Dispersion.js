import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import SpellLink from 'common/SpellLink';

import { formatPercentage } from 'common/format';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';
import Combatants from 'Parser/Core/Modules/Combatants';

import Voidform from './Voidform';

const DISPERSION_BASE_CD = 90;
const DISPERSION_REDUCTION_CD_PER_TRAIT = 10;
const DISPERSION_UPTIME_MS = 6000;

class Disperion extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    voidform: Voidform,
  };

  _dispersions = {};
  _previousDispersionCast = null;

  get dispersions() {
    return Object.keys(this._dispersions).map(key => this._dispersions[key]);
  }

  startDispersion(event) {
    this._dispersions[event.timestamp] = {
      start: event.timestamp,
    };

    this._previousDispersionCast = event;
  }

  endDispersion(event) {
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

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DISPERSION.id) this.startDispersion(event);
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DISPERSION.id) this.endDispersion(event);
  }

  suggestions(when) {
    const dispersionUptime = this.combatants.selected.getBuffUptime(SPELLS.DISPERSION.id);
    const maxDispersiontime = Math.floor(calculateMaxCasts(DISPERSION_BASE_CD - (DISPERSION_REDUCTION_CD_PER_TRAIT * this.combatants.selected.traitsBySpellId[SPELLS.FROM_THE_SHADOWS_TRAIT.id]), this.owner.fightDuration)) * DISPERSION_UPTIME_MS;
    const dispersedTime = dispersionUptime / this.maxUptime;


    when(dispersedTime).isGreaterThan(0.20)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You spent {Math.round(dispersionUptime / 1000)} seconds (out of a possible {Math.round(maxDispersiontime / 1000)} seconds) in <SpellLink id={SPELLS.DISPERSION.id} />. Consider using <SpellLink id={SPELLS.DISPERSION.id} /> less or cancel it early.</span>)
          .icon(SPELLS.DISPERSION.icon)
          .actual(`${formatPercentage(actual)}% Dispersion uptime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended, unless the encounter requires it.`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
  }
}

export default Disperion;
