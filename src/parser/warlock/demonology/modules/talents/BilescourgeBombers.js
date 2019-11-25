import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatThousands } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class BilescourgeBombers extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BILESCOURGE_BOMBERS_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BILESCOURGE_BOMBERS_DAMAGE), this.handleBilescourgeDamage);
  }

  handleBilescourgeDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.BILESCOURGE_BOMBERS_TALENT.id} /> dmg</>}
        value={this.owner.formatItemDamageDone(this.damage)}
        valueTooltip={`${formatThousands(this.damage)} damage`}
      />
    );
  }
}

export default BilescourgeBombers;
