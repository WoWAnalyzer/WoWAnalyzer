import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import SPECS from 'common/SPECS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemLink from "common/ItemLink";

import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const debug = false;

/*
 * Gain one of the following talents based on your specialization:
 * Beast Mastery: Bestial Fury
 * Marksmanship: Lock and Load
 * Survival: Serpent Sting
 */

class SoulOfTheHuntmaster extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.PARSELS_TONGUE.id);
  }

  item() {
    return {
      item: ITEMS.PARSELS_TONGUE,
      result: <span>This gave you <SpellLink id={this.talentGained} />.</span>,
    };
  }
}

export default SoulOfTheHuntmaster;
