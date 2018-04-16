import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS/HUNTER';
import PETS from 'common/PETS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import CorePets from 'Parser/Core/Modules/Pets';
import ItemDamageDone from 'Main/ItemDamageDone';

const T19_2P_DAMAGE_MODIFIER = 0.5;
const T19_2P_DAMAGE_MODIFIER_DIRE_FRENZY = 0.1;
const DIRE_BEAST_DURATION = 8000;

const DIRE_FRENZY_NOT_AFFECTED_PETS = [
  PETS.HATI.id,
  PETS.HATI_2.id,
  PETS.HATI_3.id,
  PETS.HATI_4.id,
  PETS.HATI_5.id,
  PETS.HATI_6.id,
  PETS.HATI_7.id,
];

/**
 * Dire Beast: When you use Bestial Wrath,  all of your currently summoned Dire Beasts gain 50% increased damage for 15 sec.
 * Dire Frenzy: When you use Bestial Wrath, your pet gains 10% increased damage for 15 sec.
 */

class Tier19_2p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    pets: CorePets,
  };

  currentDireBeasts = [];

  bonusDmg = 0;
  bestialWrathBaseModifier = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_BM_T19_2P_BONUS.id);
    if (this.combatants.selected.hasTalent(SPELLS.BESTIAL_FURY_TALENT) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id)) {
      this.bestialWrathBaseModifier = 0.4;
    } else {
      this.bestialWrathBaseModifier = 0.25;
    }
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
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    if (!this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id)) {
      const index = this.currentDireBeasts.findIndex(direBeast => direBeast.ID === event.sourceID && direBeast.instance === event.sourceInstance);
      const selectedDireBeast = this.currentDireBeasts[index];
      if (!selectedDireBeast) {
        return;
      }
      this.bonusDmg += getDamageBonus(event, T19_2P_DAMAGE_MODIFIER);
    } else {
      const pet = this.pets.getSourceEntity(event);
      if (DIRE_FRENZY_NOT_AFFECTED_PETS.every(id => pet.guid !== id)) {
        this.bonusDmg += getDamageBonus(event, T19_2P_DAMAGE_MODIFIER_DIRE_FRENZY);
      }
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_BM_T19_2P_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_BM_T19_2P_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HUNTER_BM_T19_2P_BONUS_BUFF.id} icon={false} />,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default Tier19_2p;
