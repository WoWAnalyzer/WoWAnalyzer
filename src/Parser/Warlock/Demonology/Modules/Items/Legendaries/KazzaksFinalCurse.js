import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';

import ItemDamageDone from 'Main/ItemDamageDone';

import DemoPets from '../../WarlockCore/Pets';

const DAMAGE_BONUS_PER_PET = 0.05;
const HAND_OF_DOOM_SUMMON_THRESHOLD = 70;

class KazzaksFinalCurse extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    demoPets: DemoPets,
  };

  _dooms = [
    // {id, instance, damageBonus}
  ];
  _hasHoD = false;
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.KAZZAKS_FINAL_CURSE.id);
    this._hasHoD = this.combatants.selected.hasTalent(SPELLS.HAND_OF_DOOM_TALENT.id);
  }

  // damage multiplier is decided when doom is CAST or REFRESHED, not when it deals damage
  on_byPlayer_applydebuff(event) {
    if (event.ability.guid !== SPELLS.DOOM.id) {
      return;
    }
    const pets = this.demoPets.getPets(event.timestamp);
    // this should exclude the Wild Imps summoned by Hand of Gul'dan when it applies Doom with Hand of Doom talent
    // while the summon events happen before apply/refreshdebuff (so it gets registered with DemoPets and ultimately is in this pets array), ingame I've tested it DOESN'T count these pets into the bonus damage
    let justSummonedImps = 0;
    if (this._hasHoD) {
      justSummonedImps = pets.filter(pet => pet.summonTimestamp >= event.timestamp - HAND_OF_DOOM_SUMMON_THRESHOLD && pet.guid === PETS.WILDIMP.id).length;
    }
    const bonus = (pets.length - justSummonedImps) * DAMAGE_BONUS_PER_PET;
    let doom = this._dooms.find(doom => doom.id === event.targetID && doom.instance === event.targetInstance);
    if (!doom) {
      doom = {
        id: event.targetID,
        instance: event.targetInstance,
        damageBonus: bonus,
      };
      this._dooms.push(doom);
    }
    else {
      doom.damageBonus = bonus;
    }
  }

  on_byPlayer_refreshdebuff(event) {
    if (event.ability.guid !== SPELLS.DOOM.id) {
      return;
    }
    const pets = this.demoPets.getPets(event.timestamp);
    let justSummonedImps = 0;
    if (this._hasHoD) {
      justSummonedImps = pets.filter(pet => pet.summonTimestamp >= event.timestamp - HAND_OF_DOOM_SUMMON_THRESHOLD && pet.guid === PETS.WILDIMP.id).length;
    }
    const bonus = (pets.length - justSummonedImps) * DAMAGE_BONUS_PER_PET;
    const doom = this._dooms.find(doom => doom.id === event.targetID && doom.instance === event.targetInstance);
    if (!doom) {
      // shouldn't happen, we add the debuff on cast
      return;
    }
    doom.damageBonus = bonus;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.DOOM.id) {
      return;
    }
    const doom = this._dooms.find(doom => doom.id === event.targetID && doom.instance === event.targetInstance);
    if (!doom) {
      // shouldn't happen, we add the debuff on cast
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, doom.damageBonus);
  }

  item() {
    return {
      item: ITEMS.KAZZAKS_FINAL_CURSE,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default KazzaksFinalCurse;
