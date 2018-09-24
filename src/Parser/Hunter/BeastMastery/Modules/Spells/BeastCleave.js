import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import StatisticListBoxItem from 'Interface/Others/StatisticListBoxItem';

/**
 * After you Multi-Shot, your pet's melee attacks also strike all other nearby enemy targets for 100% as much for the next 4 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/2TpfdMDFQWR9cYZ7#fight=12&type=damage-done
 */
class BeastCleave extends Analyzer {
  damage = 0;

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BEAST_CLEAVE_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
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
