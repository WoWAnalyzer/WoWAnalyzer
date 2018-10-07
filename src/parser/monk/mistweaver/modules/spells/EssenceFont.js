import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'parser/core/Analyzer';

const debug = false;

class EssenceFont extends Analyzer {
  castEF = 0;
  targetsEF = 0;
  efHotHeal = 0;
  efHotOverheal = 0;
  targetOverlap = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.ESSENCE_FONT_BUFF.id && event.tick === true) {
      this.efHotHeal += (event.amount || 0) + (event.absorbed || 0);
      this.efHotOverheal += event.overheal || 0;
    }
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ESSENCE_FONT.id) {
      this.castEF += 1;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
      this.targetsEF += 1;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
      this.targetsEF += 1;
      this.targetOverlap += 1;
    }
  }

  on_finished() {
    if (debug) {
      console.log(`EF Casts: ${this.castEF}`);
      console.log(`EF Targets Hit: ${this.targetsEF}`);
      console.log(`EF Avg Targets Hit per Cast: ${this.targetsEF / this.castEF}`);
    }
  }

  get efHotOverhealing() {
    return (this.efHotOverheal / (this.efHotHeal + this.efHotOverheal)).toFixed(4);
  }

  get avgTargetsHitPerEF() {
    return (this.targetsEF / this.castEF) || 0;
  }
  get efHotOverlap() {
    return ((this.targetOverlap / this.targetsEF) || 0).toFixed(2);
  }

  get suggestionThresholds() {
    return {
      actual: this.avgTargetsHitPerEF,
      isLessThan: {
        minor: 17,
        average: 14,
        major: 12,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <>
            You are currently using not utilizing your <SpellLink id={SPELLS.ESSENCE_FONT.id} /> effectively. Each <SpellLink id={SPELLS.ESSENCE_FONT.id} /> cast should hit a total of 18 targets. Either hold the cast til 6 or more targets are injured or move while casting to increase the effective range of the spell.
          </>
        )
          .icon(SPELLS.ESSENCE_FONT.icon)
          .actual(`${this.avgTargetsHitPerEF.toFixed(2)} average targets hit per cast`)
          .recommended(`${recommended} targets hit is recommended`);
      });
  }
}

export default EssenceFont;
