import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/ItemHealingDone';
import ItemDamageDone from 'interface/ItemDamageDone';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { formatNumber, formatPercentage } from 'common/format';
import { TooltipElement } from 'common/Tooltip';

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

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HARMONIOUS_CHORD.id) {
      return;
    }
    this.healing += event.amount + (event.absorbed || 0);
    this.overHealing += event.overheal || 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CACAPHONOUS_CHORD.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.LADY_WAYCRESTS_MUSIC_BOX.id);
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
