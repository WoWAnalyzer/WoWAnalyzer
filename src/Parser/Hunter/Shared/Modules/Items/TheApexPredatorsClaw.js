import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import PETS from 'common/PETS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import CorePets from 'Parser/Core/Modules/Pets';
import ItemDamageDone from 'Main/ItemDamageDone';

const APEX_DAMAGE_MODIFIER = 0.05;
const DIRE_BEAST_DURATION = 8000;

const HATI_LIST = [
  PETS.HATI.id,
  PETS.HATI_2.id,
  PETS.HATI_3.id,
  PETS.HATI_4.id,
  PETS.HATI_5.id,
  PETS.HATI_6.id,
  PETS.HATI_7.id,
];

/**
 * The Apex Predator's Claw
 * Equip: Your pet gains the passive abilities of all pet specializations and deals 5% increased damage.
 */
class TheApexPredatorsClaw extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    pets: CorePets,
  };
  currentDireBeasts = [];
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.THE_APEX_PREDATORS_CLAW.id);
  }
  on_byPlayer_summon(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.COBRA_COMMANDER.id) {
      return;
    }
    this.currentDireBeasts.push({
      end: event.timestamp + DIRE_BEAST_DURATION,
      ID: event.targetID,
      instance: event.targetInstance,
    });
  }
  on_byPlayerPet_damage(event) {
    const index = this.currentDireBeasts.findIndex(direBeast => direBeast.ID === event.sourceID && direBeast.instance === event.sourceInstance);
    const selectedDireBeast = this.currentDireBeasts[index];
    //we're not interested in any damage coming from direbeasts
    if (selectedDireBeast) {
      return;
    }
    const pet = this.pets.getSourceEntity(event);
    //we're not interested in any damage coming from Hati
    if (HATI_LIST.every(id => pet.guid !== id)) {
      this.bonusDmg += getDamageBonus(event, APEX_DAMAGE_MODIFIER);
    }
  }

  item() {
    return {
      item: ITEMS.THE_APEX_PREDATORS_CLAW,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }

}

export default TheApexPredatorsClaw;
