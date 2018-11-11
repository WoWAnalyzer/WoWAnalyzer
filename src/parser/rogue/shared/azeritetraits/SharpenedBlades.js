import React from 'react';

import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SPECS from 'game/SPECS';

import Analyzer from 'parser/core/Analyzer';

class SharpenedBlades extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SHARPENED_BLADES.id);
    this.wastedStacks = 0;

    if(this.selectedCombatant.spec === SPECS.ASSASSINATION_ROGUE) {
      this.sharpenedBladesConsumer = SPELLS.POISONED_KNIFE;
    } else {
      this.sharpenedBladesConsumer = SPELLS.SHURIKEN_TOSS;
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.MELEE.id) {
      return;
    }

    const buff = this.selectedCombatant.getBuff(SPELLS.SHARPENED_BLADES_BUFF.id);
    if(buff !== undefined && buff.stacks === 30) {
      this.wastedStacks++;
    }
  }

  get wastedStacksPm() {
    return this.wastedStacks / (this.owner.fightDuration / 1000) * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedStacksPm,
      isGreaterThan: {
        minor: 10,
        average: 20,
        major: 30,
      },
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You are wasting <SpellLink id={SPELLS.SHARPENED_BLADES.id} icon /> stacks. Try to cast <SpellLink id={this.sharpenedBladesConsumer.id} icon /> at 29+ stacks.</>)
        .icon(SPELLS.SHARPENED_BLADES.icon)
        .actual(`${formatNumber(this.wastedStacksPm)} stacks wasted per minute.`)
        .recommended(`<10 is recommended`);
    });
  }
}

export default SharpenedBlades;
