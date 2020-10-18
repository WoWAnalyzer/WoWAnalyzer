import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber } from 'common/format';
import ItemDamageDone from 'interface/ItemDamageDone';
import Abilities from 'parser/core/modules/Abilities';
import Events from 'parser/core/Events';

const ACTIVATION_COOLDOWN = 120; // seconds

/**
 * Rotcrusted Voodoo Doll
 * Use: Brandish the Voodoo Doll at your target,
 * dealing X Shadow damage over 6 sec, and an additional X Shadow damage after 6 sec. (2 Min Cooldown)
 *
 * Example log: /report/hYkG1MtKyxB8cPRZ/3-Heroic+Taloc+-+Kill+(3:49)/9-Qt/abilities
 */
class RotcrustedVoodooDoll extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  damage = 0;
  ticks = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.ROTCRUSTED_VOODOO_DOLL.id);

    if (this.active) {
        this.abilities.add({
          spell: SPELLS.ROTCRUSTED_VOODOO_DOLL_BUFF,
          buffSpellId: SPELLS.ROTCRUSTED_VOODOO_DOLL_TICK.id,
          name: ITEMS.ROTCRUSTED_VOODOO_DOLL.name,
          category: Abilities.SPELL_CATEGORIES.ITEMS,
          cooldown: ACTIVATION_COOLDOWN,
          castEfficiency: {
            suggestion: true,
          },
        });
      }
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.ROTCRUSTED_VOODOO_DOLL_TICK, SPELLS.ROTCRUSTED_VOODOO_DOLL_HIT]), this.onDamage);
  }

  onDamage(event) {
    this.damage += event.amount + (event.absorbed || 0);
    this.ticks += 1;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={<><strong>{this.ticks}</strong> ticks, causing <strong>{formatNumber(this.damage)}</strong> damage.</>}
      >
        <BoringItemValueText item={ITEMS.ROTCRUSTED_VOODOO_DOLL}>
          <ItemDamageDone amount={this.damage} />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default RotcrustedVoodooDoll;
