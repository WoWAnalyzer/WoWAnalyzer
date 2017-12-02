import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber } from 'common/format';
import getDamageBonus from "Parser/Hunter/Shared/Modules/getDamageBonus";
import SpellIcon from "common/SpellIcon";
import ITEMS from "common/ITEMS/HUNTER";
import SpellLink from "common/SpellLink";
import CorePets from 'Parser/Core/Modules/Pets';
import PETS from "common/PETS";

const T19_2P_DAMAGE_MODIFIER = 0.5;
const T19_2P_DAMAGE_MODIFIER_DIRE_FRENZY = 0.1;

const DIRE_FRENZY_NOT_AFFECTED_PETS = [
  PETS.HATI.id,
];

const DIRE_BEAST = [
  PETS.DIRE_BEAST.id,
];

class Tier19_2p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    pets: CorePets,
  };

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

  on_byPlayerPet_damage(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    const pet = this.pets.getSourceEntity(event);
    if (!this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id)) {
      if (DIRE_BEAST.every(id => pet.guid !== id)) {
        return;
      }
      this.bonusDmg += getDamageBonus(event, T19_2P_DAMAGE_MODIFIER);
    } else {
      if (DIRE_FRENZY_NOT_AFFECTED_PETS.every(id => pet.guid !== id)) {
        this.bonusDmg += getDamageBonus(event, T19_2P_DAMAGE_MODIFIER_DIRE_FRENZY);
      }
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_BM_T19_2P_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_BM_T19_2P_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HUNTER_BM_T19_2P_BONUS_BUFF.id} />,
      result: (
        <dfn>
          {formatNumber(this.bonusDmg)} - {this.owner.formatItemDamageDone(this.bonusDmg)}
        </dfn>
      ),
    };
  }
}

export default Tier19_2p;
