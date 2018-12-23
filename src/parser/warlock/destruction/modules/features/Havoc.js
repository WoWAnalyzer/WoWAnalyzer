import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatThousands } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class Havoc extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damage = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp)) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  // TODO: this could perhaps be reworked somehow to be more accurate but not sure how yet. Take it as a Havoc v1.0
  statistic() {
    if (this.damage === 0) {
      return null;
    }

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HAVOC.id} />}
        value={this.owner.formatItemDamageDone(this.damage)}
        label="Damage cleaved"
        tooltip={`You cleaved ${formatThousands(this.damage)} damage to targets afflicted by your Havoc.<br /><br />
                Note: This number is probably higher than it should be, as it also counts the damage you did directly to the Havoc target (not just the cleaved damage).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default Havoc;
