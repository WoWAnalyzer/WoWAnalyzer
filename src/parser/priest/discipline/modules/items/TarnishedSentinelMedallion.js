import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import ItemDamageDone from 'interface/others/ItemDamageDone';

import isAtonement from '../core/isAtonement';
import AtonementDamageSource from '../features/AtonementDamageSource';

class TarnishedSentinelMedallion extends Analyzer {
  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
  };

  healing = 0;
  damage = 0;
  damageAbilities = new Set([SPELLS.SPECTRAL_BOLT.id, SPELLS.SPECTRAL_BLAST.id]);

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.TARNISHED_SENTINEL_MEDALLION.id);
  }

  on_byPlayer_heal(event) {
    if (!isAtonement(event)) {
      return;
    }
    if (!this.atonementDamageSource.event || !this.damageAbilities.has(this.atonementDamageSource.event.ability.guid)) {
      return;
    }
    this.healing += event.amount + (event.absorbed || 0);
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
        <React.Fragment>
          <ItemHealingDone amount={healing} /><br />
          <ItemDamageDone amount={damage} />
        </React.Fragment>
      ),
    };
  }
}

export default TarnishedSentinelMedallion;
