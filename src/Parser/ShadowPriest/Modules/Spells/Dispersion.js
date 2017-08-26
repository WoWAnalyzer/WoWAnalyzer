import React from 'react';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

import SpellLink from 'common/SpellLink';

import { formatPercentage } from 'common/format';
import { calculateMaxCasts } from 'Parser/Core/getCastEfficiency';

class Disperion extends Module {
  _dispersions = {};
  _previousDispersionCast = null;

  on_initialized() {
    this.active = true;
  }

  get uptime(){
    return this.dispersionsAsArray.reduce((p, c) => p += c.end - c.start, 0);
  }

  get maxUptime(){
    const fightDuration = this.owner.fight.end_time - this.owner.fight.start_time;
    return Math.round(calculateMaxCasts(90 - (10 * this.owner.selectedCombatant.traitsBySpellId[SPELLS.FROM_THE_SHADOWS_TRAIT.id]), fightDuration)) * 6000;
  }

  get dispersionsAsArray(){
    return Object.keys(this._dispersions).map(key => this._dispersions[key]);
  }

  startedDispersion(event){
    this._dispersions[event.timestamp] = {
      start: event.timestamp,
    };

    this._previousDispersionCast = event;
  }

  finishedDispersion(event){
    this._dispersions[this._previousDispersionCast.timestamp] = {
      ...this._dispersions[this._previousDispersionCast.timestamp],
      end: event.timestamp,
    };

    this._previousDispersionCast = null;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DISPERSION.id) {
      return;
    }

    this.startedDispersion(event);
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DISPERSION.id) {
      return;
    }

    this.finishedDispersion(event);
  }

  suggestions(when) {
    const dispersedTime       = this.uptime / this.maxUptime;
    when(dispersedTime).isGreaterThan(0.20)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You spent {Math.round(this.uptime/1000)} seconds (out of a possible {Math.round(this.maxUptime/1000)} seconds) in <SpellLink id={SPELLS.DISPERSION.id} />. Consider using <SpellLink id={SPELLS.DISPERSION.id} /> less or cancel it early.</span>)
          .icon(SPELLS.DISPERSION.icon)
          .actual(`${formatPercentage(actual)}% Dispersion uptime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended, unless the encounter requires it.`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
  }
}

export default Disperion;