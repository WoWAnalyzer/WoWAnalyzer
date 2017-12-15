import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';

const debug = false;

class EssenceFontMastery extends Analyzer {
  castEF = 0;
  targetsEF = 0;

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
    }
  }

  on_finished() {
    if (debug) {
      console.log(`EF Casts: ${this.castEF}`);
      console.log(`EF Targets Hit: ${this.targetsEF}`);
      console.log(`EF Avg Targets Hit per Cast: ${this.targetsEF / this.castEF}`);
    }
  }

  get avgTargetsHitPerEF() {
    return (this.targetsEF / this.castEF) || 0;
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
    when(this.avgTargetsHitPerEF).isLessThan(17)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are currently using not utilizing your <SpellLink id={SPELLS.ESSENCE_FONT.id} /> effectively. Each <SpellLink id={SPELLS.ESSENCE_FONT.id} /> cast should hit a total of 18 targets. Either hold the cast til 6 or more targets are injured or move while casting to increase the effective range of the spell.</span>)
          .icon(SPELLS.ESSENCE_FONT.icon)
          .actual(`${this.avgTargetsHitPerEF.toFixed(2)} average targets hit per cast`)
          .recommended(`${recommended} targets hit is recommended`)
          .regular(recommended - 3).major(recommended - 5);
      });
  }
}

export default EssenceFontMastery;
