import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import { formatNumber, formatPercentage } from 'common/format';

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
    this.healing += event.amount + (event.absorb || 0);
    this.overHealing += event.overheal || 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CACAPHONOUS_CHORD.id) {
      return;
    }
    this.damage += event.amount + (event.absorb || 0);
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.LADY_WAYCRESTS_MUSIC_BOX.id);
  }

  item() {
    return {
      item: ITEMS.LADY_WAYCRESTS_MUSIC_BOX,
      result: (
        <>
          <dfn data-tip={`Healing done: ${formatNumber(this.healing)} (${formatPercentage(this.overhealPercent)}% OH)`}>
            <ItemHealingDone amount={this.healing} />
          </dfn>
          <br />
          <dfn data-tip={`Damage done: ${formatNumber(this.damage)}`}>
            <ItemDamageDone amount={this.damage} />
          </dfn>
        </>
      ),
    };
  }
}

export default LadyWaycrestsMusicBox;
