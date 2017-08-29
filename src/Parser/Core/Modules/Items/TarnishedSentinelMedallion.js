import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import { formatNumber } from 'common/format';

class TarnishedSentinelMedallion extends Module {
  damage = 0;
  damageAbilities = new Set([SPELLS.SPECTRAL_BOLT.id, SPELLS.SPECTRAL_BLAST.id]);

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.TARNISHED_SENTINEL_MEDALLION.id);
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.damageAbilities.has(spellId)) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.TARNISHED_SENTINEL_MEDALLION,
      result: `${formatNumber(this.damage)} damage - ${this.owner.formatItemDamageDone(this.damage)}`,
    };
  }
}

export default TarnishedSentinelMedallion;
