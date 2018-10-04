import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

class SoulflayersCorruption extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasChest(ITEMS.SOULFLAYERS_CORRUPTION.id);
  }

  heal=0;
  damage=0;
  absorb=0;
  umbilicusEternusCount=0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BLOOD_PLAGUE.id) {
      this.heal += calculateEffectiveHealing(event,1);
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BLOOD_PLAGUE.id) {
      this.damage += calculateEffectiveDamage(event,1);
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.UMBILICUS_ETERNUS_BUFF.id) {
      this.umbilicusEternusCount+=1;
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.UMBILICUS_ETERNUS_BUFF.id) {
      this.absorb += calculateEffectiveHealing(event,1);
    }
  }

  item() {
    const perProc=this.absorb/this.umbilicusEternusCount;
    return {
      item: ITEMS.SOULFLAYERS_CORRUPTION,
      result: (
        <>
          <ItemHealingDone amount={this.heal} /><br />
          <ItemDamageDone amount={this.damage} /><br />
          Increased <SpellLink id={SPELLS.UMBILICUS_ETERNUS.id} /> trait absorbs by: <br />
          <b>Avg Per Proc:</b> {formatNumber(perProc)}  |  <b>Total:</b> {formatNumber(this.absorb)}
        </>
      ),
    };
  }

}

export default SoulflayersCorruption;
