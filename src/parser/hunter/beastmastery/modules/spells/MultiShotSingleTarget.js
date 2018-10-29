import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

/**
 * Tracks the amount of multi-shot casts that did not trigger any beast cleave damage
 *
 * Example log: https://www.warcraftlogs.com/reports/zjgLyKdZnhMkPJDq#fight=67&type=damage-done&source=915
 */
class MultiShotSingleTarget extends Analyzer {

  cleaveUp = false;
  beastCleaveHits = 0;
  casts = 0;
  castsWithoutHits = 0;

  constructor(...args) {
    super(...args);
  }

  on_toPlayerPet_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BEAST_CLEAVE_PET_BUFF.id) {
      return;
    }

    // Refreshes? Not sure if this is needed, or if removebuff is called before this.
    if (this.cleaveUp && this.beastCleaveHits == 0) {
      this.castsWithoutHits++;
    }

    this.cleaveUp = true;
    this.beastCleaveHits = 0;
  }

  on_toPlayerPet_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BEAST_CLEAVE_PET_BUFF.id) {
      return;
    }

    if (this.beastCleaveHits === 0) {
      this.castsWithoutHits++;
    }
    this.cleaveUp = false;
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BEAST_CLEAVE_DAMAGE.id) {
      return;
    }
    this.beastCleaveHits++;
  }

  suggestions(when) {
    when({
      actual: this.castsWithoutHits,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 3
      },
      style: 'number'
    }).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You've casted <SpellLink id={SPELLS.MULTISHOT_BM.id} /> {actual} time{actual == 1 ? '' : 's'} without your pets doing any <SpellLink id={SPELLS.BEAST_CLEAVE_PET_BUFF.id} /> damage onto additional targets. On single-target situations, avoid using multi-shot.</>)
        .icon(SPELLS.BEAST_CLEAVE_PET_BUFF.icon)
        .actual(`${actual} cast${actual == 1 ? '' : 's'} without any Beast Cleave damage`)
        .recommended(`0 is recommended`);
    })
  }
}

export default MultiShotSingleTarget;
