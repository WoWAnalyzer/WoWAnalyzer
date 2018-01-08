import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Wrapper from 'common/Wrapper';

class UnempoweredLS extends Analyzer {
  _castQueue = {
    empowered: false,
    enemies: 0,
  };
  casts = [];
  _lunarEmpsOn = false;
  _warriorOfEluneOn = false;
  _owlkinFrenzyOn = false;

  suboptUmempLS = 0;

  isLunarStrike(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.LUNAR_STRIKE.id;
  }
  isLunarEmpowerment(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.LUNAR_EMP_BUFF.id;
  }
  isOwlkinFrenzy(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.OWLKIN_FRENZY.id;
  }
  isWarriorOfElune(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.WARRIOR_OF_ELUNE_TALENT.id;
  }

  on_byPlayer_cast(event) {
    if (!this.isLunarStrike(event)) {
      return;
    }
    this.casts.push(this._castQueue);
    this._castQueue = {
      empowered: this._lunarEmpsOn || this._warriorOfEluneOn || this._owlkinFrenzyOn,
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
    } else if (this.isWarriorOfElune(event)) {
      this._warriorOfEluneOn = true;
    }  else if (this.isOwlkinFrenzy(event)) {
      this._owlkinFrenzyOn = true;
    }  
  }
  on_toPlayer_removebuff(event) {
    if (this.isLunarEmpowerment(event)) {
      this._lunarEmpsOn = false;
    } else if (this.isWarriorOfElune(event)) {
      this._warriorOfEluneOn = false;
    } else if (this.isOwlkinFrenzy(event)) {
      this._owlkinFrenzyOn = false;
    }
  }

  on_finished() {
    this.casts.push(this._castQueue);

    this.suboptUmempLS = this.casts.filter((cast) =>  !cast.empowered && cast.enemies > 0 && cast.enemies < 4).length;
  }

  get subOptimalPerMinute(){
    return ((this.suboptUmempLS) / (this.owner.fightDuration / 1000)) * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.subOptimalPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You casted {this.suboptUmempLS} unempowered and non instant cast <SpellLink id={SPELLS.LUNAR_STRIKE.id} /> that hit less than 4 targets. Always prioritize Solar Wrath as a filler if there are less than 4 targets.</Wrapper>)
        .icon(SPELLS.LUNAR_STRIKE.icon)
        .actual(`${formatNumber(actual)} Unempowered LS per minute`)
        .recommended(`${recommended} Unempowered LS are recomended`);
    });
  }
}

export default UnempoweredLS;
