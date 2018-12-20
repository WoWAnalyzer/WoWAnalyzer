import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

/**
 * After you Multi-Shot, your pet's melee attacks also strike all other nearby enemy targets for 100% as much for the next 4 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/2TpfdMDFQWR9cYZ7#fight=12&type=damage-done
 *
 * This module also tracks the amount of multi-shot casts that did not trigger any beast cleave damage
 * Example: https://www.warcraftlogs.com/reports/zjgLyKdZnhMkPJDq#fight=67&type=damage-done&source=915
 */
class BeastCleave extends Analyzer {
  damage = 0;
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
    this.damage += event.amount + (event.absorbed || 0);
    this.beastCleaveHits++;
  }

  get beastCleavesWithoutHits() {
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
      when(this.beastCleavesWithoutHits).addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You cast <SpellLink id={SPELLS.MULTISHOT_BM.id} /> {actual} time{actual === 1 ? '' : 's'} without your pets doing any <SpellLink id={SPELLS.BEAST_CLEAVE_PET_BUFF.id} /> damage onto additional targets. On single-target situations, avoid using <SpellLink id={SPELLS.MULTISHOT_BM.id} />.</>)
          .icon(SPELLS.MULTISHOT_BM.icon)
          .actual(`${actual} cast${actual === 1 ? '' : 's'} without any Beast Cleave damage`)
          .recommended(`${recommended} is recommended`);
      });
    }
  }

  subStatistic() {
    //Beast Cleave is only used on AoE - no reason to show this statistic on single-target, so this just checks if Beast Cleave did any damage at all, since it only makes sense to show it on AoE fights.
    if (this.damage > 0) {
      return (
        <StatisticListBoxItem
          title={<SpellLink id={SPELLS.BEAST_CLEAVE_BUFF.id} />}
          value={<ItemDamageDone amount={this.damage} />}
        />
      );
    }
    return null;
  }
}

export default BeastCleave;
