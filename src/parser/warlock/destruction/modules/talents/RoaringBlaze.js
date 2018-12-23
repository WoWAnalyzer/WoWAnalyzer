import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

/*
  Roaring Blaze (Tier 90 Destruction talent):
    Conflagrate burns the target for an additional (48% of Spell power) Fire damage over 6 sec.
 */
class RoaringBlaze extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ROARING_BLAZE_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ROARING_BLAZE_DAMAGE), this.onRoaringBlazeDamage);
  }

  onRoaringBlazeDamage(event) {
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.ROARING_BLAZE_TALENT.id} /> damage</>}
        value={this.owner.formatItemDamageDone(this.damage)}
        valueTooltip={`${formatThousands(this.damage)} damage`}
      />
    );
  }
}

export default RoaringBlaze;
