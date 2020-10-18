import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import ItemHealingDone from 'interface/ItemHealingDone';
import Events from 'parser/core/Events';

/**
 * Equip: Your attacks and attacks made against you have a chance to trigger spores to grow for 4 sec before bursting.
 * When they burst, they restore [x] health to you and deal [y] damage split among enemies within 8 yds.
 *
 * The growing spores buff is always applied to the player.
 * It's possible to get a second proc while the "growing spores" buff is already active. In that case
 * the old buff is triggered early, does its damage and healing, and is replaced by the new buff.
 * In short: overlapping procs are not wasted.
 *
 * Test Log: https://www.warcraftlogs.com/reports/aMVBAP6Tc4YDkqrF#fight=1&type=damage-done&source=18
 */
class LingeringSporepods extends Analyzer {
  damage = 0;
  healing = 0;
  totalProcs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.LINGERING_SPOREPODS.id);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.LINGERING_SPOREPODS_BUFF), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.LINGERING_SPOREPODS_BUFF), this.onRefreshBuff);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.LINGERING_SPOREPODS_DAMAGE), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LINGERING_SPOREPODS_HEAL), this.onHeal);
  }

  onApplyBuff(event) {
    this.totalProcs += 1;
  }

  onRefreshBuff(event) {
    this.totalProcs += 1;
  }

  onDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onHeal(event) {
    this.healing += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={<>Procced <strong>{this.totalProcs}</strong> time{this.totalProcs === 1 ? '' : 's'}.</>}
      >
        <BoringItemValueText item={ITEMS.LINGERING_SPOREPODS}>
          <ItemDamageDone amount={this.damage} /><br />
          <ItemHealingDone amount={this.healing} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default LingeringSporepods;
