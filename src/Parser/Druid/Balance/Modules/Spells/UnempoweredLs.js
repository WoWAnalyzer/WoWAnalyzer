import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

class UnempoweredLS extends Analyzer {
  _castQueue = {
    empowered: false,
    enemies: 0,
  };
  casts = [];
  _lunarEmpsOn = false;

  suboptUmempLS = 0;

  isLunarStrike(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.LUNAR_STRIKE.id;
  }
  isLunarEmpowerment(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.LUNAR_EMP_BUFF.id;
  }

  on_byPlayer_cast(event) {
    if (!this.isLunarStrike(event)) {
      return;
    }
    this.casts.push(this._castQueue);
    this._castQueue = {
      empowered: this._lunarEmpsOn,
      enemies: 0,
    };
  }

  on_byPlayer_damage(event) {
    if (!this.isLunarStrike(event)) {
      return;
    }
    this._castQueue.enemies += 1;
  }

  on_toPlayer_applybuff(event) {
    if (this.isLunarEmpowerment(event)) {
      this._lunarEmpsOn = true;
    }
  }
  on_toPlayer_removebuff(event) {
    if (this.isLunarEmpowerment(event)) {
      this._lunarEmpsOn = false;
    }
  }

  on_finished() {
    this.casts.push(this._castQueue);

    this.suboptUmempLS = this.casts.filter((cast) =>  !cast.empowered && cast.enemies > 0 && cast.enemies < 3).length;
  }

  suggestions(when) {
    const suboptPerMin = ((this.suboptUmempLS) / (this.owner.fightDuration / 1000)) * 60;
    when(suboptPerMin).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You casted {this.suboptUmempLS} unempowered <SpellLink id={SPELLS.LUNAR_STRIKE.id} /> that hit less than 3 targets. Always prioritize Solar Wrath as a filler if there are less than 3 targets.</span>)
          .icon(SPELLS.LUNAR_STRIKE.icon)
          .actual(`${formatNumber(actual)} Unempowered LS per minute`)
          .recommended(`${recommended} Unempowered LS that hits less than 3 targets are recomended`)
          .regular(recommended + 2).major(recommended + 4);
      });
  }
}

export default UnempoweredLS;
