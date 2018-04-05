import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import CorePets from 'Parser/Core/Modules/Pets';
import PETS from 'common/PETS';
import ItemDamageDone from 'Main/ItemDamageDone';

const BLINK_STRIKES_MELEE_MODIFIER = 1;
const DIRE_BEAST_DURATION = 8000;

const BLINK_STRIKES_NOT_AFFECTED_PETS = [
  PETS.HATI.id,
  PETS.HATI_2.id,
  PETS.HATI_3.id,
  PETS.HATI_4.id,
  PETS.HATI_5.id,
  PETS.HATI_6.id,
  PETS.HATI_7.id,
];

class BlinkStrikes extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    pets: CorePets,
  };

  damage = 0;
  currentDireBeasts = [];

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BLINK_STRIKES_TALENT.id);
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
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MELEE.id) {
      return;
    }
    const index = this.currentDireBeasts.findIndex(direBeast => direBeast.ID === event.sourceID && direBeast.instance === event.sourceInstance);
    const selectedDireBeast = this.currentDireBeasts[index];
    if (selectedDireBeast) {
      return;
    }
    const pet = this.pets.getSourceEntity(event);
    if (BLINK_STRIKES_NOT_AFFECTED_PETS.some(id => pet.guid === id)) {
      return;
    }
    this.damage += getDamageBonus(event, BLINK_STRIKES_MELEE_MODIFIER);
  }

  subStatistic() {
    if (this.damage > 0) {
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.BLINK_STRIKES_TALENT.id} />
          </div>
          <div className="flex-sub text-right">
            <ItemDamageDone amount={this.damage} />
          </div>
        </div>
      );
    }
  }
}

export default BlinkStrikes;
