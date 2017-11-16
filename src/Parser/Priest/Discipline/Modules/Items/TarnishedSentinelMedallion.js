import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import isAtonement from '../Core/isAtonement';
import AtonementSource from '../Features/AtonementSource';

const debug = false;

class TarnishedSentinelMedallion extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    atonementSource: AtonementSource,
  };

  healing = 0;
  damage = 0;
  damageAbilities = new Set([SPELLS.SPECTRAL_BOLT.id, SPELLS.SPECTRAL_BLAST.id]);

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.TARNISHED_SENTINEL_MEDALLION.id);
  }

  on_byPlayer_heal(event) {
    if (!isAtonement(event)) {
      return;
    }
    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      // If combatant oesn't exist it's probably a pet, this shouldn't be noteworthy.
      debug && console.log('Skipping Atonement heal event since combatant couldn\'t be found:', event);
      return;
    }
    if (this.atonementSource.atonementDamageSource) {
      if (!this.damageAbilities.has(this.atonementSource.atonementDamageSource.ability.guid)) {
        return;
      }
      this.healing += event.amount + (event.absorbed || 0);
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.damageAbilities.has(spellId)) {
      return;
    }

    this.damage += event.amount;
  }

  item() {
    const damage = this.damage || 0;
    const healing = this.healing || 0;

    return {
      item: ITEMS.TARNISHED_SENTINEL_MEDALLION,
      result: (
        <dfn>
          {this.owner.formatItemHealingDone(healing)} <br/>
          {this.owner.formatItemDamageDone(damage)}
        </dfn>
      ),
    };
  }
}

export default TarnishedSentinelMedallion;
