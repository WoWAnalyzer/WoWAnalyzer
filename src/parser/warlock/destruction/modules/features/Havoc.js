import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import Events from 'parser/core/Events';

import SPELLS from 'common/SPELLS';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';

import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class Havoc extends Analyzer {
  get dps() {
    return this.damage / this.owner.fightDuration * 1000;
  }

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
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="small"
        tooltip={(
          <>
            You cleaved {formatThousands(this.damage)} damage to targets afflicted by your Havoc.<br /><br />

            Note: This number is probably higher than it should be, as it also counts the damage you did directly to the Havoc target (not just the cleaved damage).
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.HAVOC}>
          {formatNumber(this.dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Havoc;
