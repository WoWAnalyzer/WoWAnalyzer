import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import ITEMS from 'common/ITEMS';
import PETS from 'common/PETS';

const COOLDOWN_REDUCING_PETS = new Set([
  PETS.WILDIMP.id,
  PETS.WILDIMP_ON_DREADSTALKER.id,
  PETS.DREADSTALKER.id,
  PETS.DARKGLARE.id,
]);

class WilfredRing extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  cooldownReduction = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.WILFREDS_SIGIL_OF_SUPERIOR_SUMMONING.id);
  }

  on_byPlayer_summon(event) {
    const petInfo = this.owner.playerPets.find(pet => pet.id === event.targetID);
    if (COOLDOWN_REDUCING_PETS.has(petInfo.guid)) {
      this.cooldownReduction += 2;
    }
  }

  get extraSummons() {
    return Math.floor(this.cooldownReduction / 180);
  }

  item() {
    return {
      item: ITEMS.WILFREDS_SIGIL_OF_SUPERIOR_SUMMONING,
      result: (
        <dfn data-tip={`Total Summon Doomguard/Infernal cooldown reduction - ${this.cooldownReduction} seconds`}>
          {this.extraSummons} extra summons
        </dfn>
      ),
    };
  }
}

export default WilfredRing;
