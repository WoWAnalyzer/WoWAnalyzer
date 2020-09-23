import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import StatTracker from 'parser/shared/modules/StatTracker';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { calculateSecondaryStatDefault } from 'common/stats';
import UptimeIcon from 'interface/icons/Uptime';
import { formatNumber, formatPercentage } from 'common/format';
import HasteIcon from 'interface/icons/Haste';

/**
 * Equip: Every 12 spells, gain 800 Haste for 12 sec, then lose 150 Haste for 6 sec.
 *
 * Example log: https://www.warcraftlogs.com/reports/JbX2KpDxaVj41BNy#fight=38&type=summary&source=161
 */
class SubroutineRecalibration extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  hasteBuffAmount = 0;
  hasteDebuffAmount = 0;

  protected statTracker!: StatTracker;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasRedPunchcard(ITEMS.SUBROUTINE_RECALIBRATION.id);
    if (!this.active) {
      return;
    }

    this.hasteBuffAmount = calculateSecondaryStatDefault(430, 843, this.selectedCombatant.getRedPunchcard(ITEMS.SUBROUTINE_RECALIBRATION.id)?.itemLevel);
    this.hasteDebuffAmount = calculateSecondaryStatDefault(430, 159, this.selectedCombatant.getRedPunchcard(ITEMS.SUBROUTINE_RECALIBRATION.id)?.itemLevel);

    options.statTracker.add(SPELLS.SUBROUTINE_RECALIBRATION_BUFF.id, {
      haste: this.hasteBuffAmount,
    });

    options.statTracker.add(SPELLS.SUBROUTINE_RECALIBRATION_DEBUFF.id, {
      haste: -this.hasteDebuffAmount,
    });
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SUBROUTINE_RECALIBRATION_BUFF.id) / this.owner.fightDuration;
  }

  get debuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SUBROUTINE_RECALIBRATION_DEBUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.SUBROUTINE_RECALIBRATION}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>uptime</small><br />
          <HasteIcon /> {formatNumber(this.buffUptime * this.hasteBuffAmount - this.debuffUptime * this.hasteDebuffAmount)} <small>average Haste gained</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default SubroutineRecalibration;
