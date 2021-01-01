import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPECS from 'game/SPECS';
import Events, { DamageEvent, FightEndEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellLink from 'common/SpellLink';

//For Blade dance and Death Sweep
class BladeDance extends Analyzer {
  get suggestionThresholds() {
    return {
      actual: this.badCast,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  badCast = 0;
  hitCount = 0;
  hitTimeStamp: number = 0;
  firstHitTimeStamp: number = 0;
  strikeTime: number = 1000;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.spec === SPECS.HAVOC_DEMON_HUNTER;
    if (!this.active || this.selectedCombatant.hasTalent(SPELLS.TRAIL_OF_RUIN_TALENT) || this.selectedCombatant.hasTalent(SPELLS.FIRST_BLOOD_TALENT)) {
        return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEATH_SWEEP_DAMAGE), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLADE_DANCE_DAMAGE), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLADE_DANCE_DAMAGE_LAST_HIT), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEATH_SWEEP_DAMAGE_LAST_HIT), this.onDamage);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onDamage(event: DamageEvent) {
    //Function both for Blade Dance and Death Sweep
    //less than 5 hits = single target, bad cast.
    this.hitTimeStamp = event.timestamp;
    if (event.timestamp > this.firstHitTimeStamp + this.strikeTime){
      //New Strike
      if(this.hitCount < 5 && this.hitCount > 1) {
        //chech if last strike was bad
        this.badCast += 1;
      }
      this.firstHitTimeStamp = this.hitTimeStamp //Timestamp for first hit in strike
      this.hitCount = 0;
    }
    this.hitCount += 1;
  }

  onFightEnd(event: FightEndEvent){
    if (this.hitCount < 5){
      //Check last strike
      this.badCast += 1;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
    .addSuggestion((suggest, actual, recommended) => suggest(<>You should not cast <SpellLink id={SPELLS.BLADE_DANCE.id} /> or <SpellLink id={SPELLS.DEATH_SWEEP.id} /> on single target when you are not using <SpellLink id={SPELLS.FIRST_BLOOD_TALENT.id} /> or <SpellLink id={SPELLS.TRAIL_OF_RUIN_TALENT.id} /> as a talent,</>)
        .icon(SPELLS.BLADE_DANCE.icon)
        .actual(<>{actual} bad casts</>)
        .recommended(`No bad casts is recommended.`));
  }
}

export default BladeDance;
