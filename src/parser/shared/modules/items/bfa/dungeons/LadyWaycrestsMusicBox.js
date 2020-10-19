import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemDamageDone from 'interface/ItemDamageDone';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { formatNumber, formatPercentage } from 'common/format';
import { TooltipElement } from 'common/Tooltip';
import Events from 'parser/core/Events';

/**
 * Lady Waycrest's Music Box -
 * Equip: Your damaging spells have a chance to cause a Cacaphonous Chord, dealing 1754 damage to a nearby enemy.
 * Your healing spells have a chance to cause a Harmonious Chord, restoring 2087 health to a nearby injured ally.
 *
 * Example Log: /report/VcN7xqhXvLFbpJP6/5-Mythic+Zek'voz+-+Kill+(7:20)/17-Aryëm
 */
class LadyWaycrestsMusicBox extends Analyzer {
  healing = 0;
  overHealing = 0;
  damage = 0;

  get overhealPercent() {
    return this.overHealing / (this.healing + this.overHealing);
  }

  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
    this.overHealing += event.overheal || 0;
  }

  onDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.LADY_WAYCRESTS_MUSIC_BOX.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HARMONIOUS_CHORD), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CACAPHONOUS_CHORD), this.onDamage);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.LADY_WAYCRESTS_MUSIC_BOX}>
          <TooltipElement content={`Healing done: ${formatNumber(this.healing)} (${formatPercentage(this.overhealPercent)}% OH)`}>
            <ItemHealingDone amount={this.healing} />
          </TooltipElement>
          <br />
          <TooltipElement content={`Damage done: ${formatNumber(this.damage)}`}>
            <ItemDamageDone amount={this.damage} />
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default LadyWaycrestsMusicBox;
