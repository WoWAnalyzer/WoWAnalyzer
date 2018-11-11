import React from 'react';
import Analyzer from 'parser/core/Analyzer';
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

  on_toPlayerPet_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BEAST_CLEAVE_PET_BUFF.id) {
      return;
    }

    this.casts++;
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

  on_toPlayerPet_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BEAST_CLEAVE_PET_BUFF.id) {
      return;
    }

    this.casts++;
    if (this.beastCleaveHits === 0) {
      this.castsWithoutHits++;
    }

    this.beastCleaveHits = 0;
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BEAST_CLEAVE_DAMAGE.id) {
      return;
    }
    this.beastCleaveHits++;
  }

  get castsWithoutHitsTreshold() {
    return {
      actual: this.castsWithoutHits,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 3,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    if (this.casts > 0) {
      when(this.castsWithoutHitsTreshold).addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You cast <SpellLink id={SPELLS.MULTISHOT_BM.id} /> {actual} time{actual === 1 ? '' : 's'} without your pets doing any <SpellLink id={SPELLS.BEAST_CLEAVE_PET_BUFF.id} /> damage onto additional targets. On single-target situations, avoid using <SpellLink id={SPELLS.MULTISHOT_BM.id} />.</>)
          .icon(SPELLS.MULTISHOT_BM.icon)
          .actual(`${actual} cast${actual === 1 ? '' : 's'} without any Beast Cleave damage`)
          .recommended(`${recommended} is recommended`);
      });
    }
  }
}

export default MultiShotSingleTarget;
