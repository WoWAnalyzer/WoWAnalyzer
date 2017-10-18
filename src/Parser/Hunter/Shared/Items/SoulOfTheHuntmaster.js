import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import SPECS from 'common/SPECS';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemLink from "common/ItemLink";

import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const debug = false;

class SoulOfTheHuntmaster extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id);
    //Checks which spec has the ring equipped and then sets option1 or option2 accordingly - aswell as sets up the check for if they've picked another talent
    switch (this.combatants.selected.spec) {
      case SPECS.MARKSMANSHIP_HUNTER:
        debug && console.log('SPEC DETECTED AS MM');
        this.talentGained = SPELLS.LOCK_AND_LOAD_TALENT.id;
        this.option1 = SPELLS.TRUE_AIM_TALENT.id;
        this.option2 = SPELLS.BLACK_ARROW_TALENT.id;
        this.hasPickedOtherTalent = this.combatants.selected.hasTalent(this.option1) || this.combatants.selected.hasTalent(this.option2);
        break;
      case SPECS.BEAST_MASTERY_HUNTER:
        debug && console.log('SPEC DETECTED AS BM');
        this.talentGained = SPELLS.BESTIAL_FURY_TALENT.id;
        this.option1 = SPELLS.ONE_WITH_THE_PACK_TALENT.id;
        this.option2 = SPELLS.BLINK_STRIKES_TALENT.id;
        this.hasPickedOtherTalent = this.combatants.selected.hasTalent(this.option1) || this.combatants.selected.hasTalent(this.option2);
        break;
      case SPECS.SURVIVAL_HUNTER:
        debug && console.log('SPEC DETECTED AS SV');
        this.talentGained = SPELLS.SERPENT_STING_TALENT.id;
        this.option1 = SPELLS.BUTCHERY_TALENT.id;
        this.option2 = SPELLS.DRAGONSFIRE_GRENADE_TALENT.id;
        this.hasPickedOtherTalent = this.combatants.selected.hasTalent(this.option1) || this.combatants.selected.hasTalent(this.option2);
        break;
      default:
        debug && console.log(' NO SPEC DETECTED');

        break;
    }
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_HUNTMASTER,
      result: <span>This gave you <SpellLink id={this.talentGained} />.</span>,
    };
  }

  suggestions(when) {
    when(this.hasPickedOtherTalent).isFalse().addSuggestion((suggest) => {
      return suggest(<span>When using <ItemLink id={ITEMS.SOUL_OF_THE_HUNTMASTER.id} /> please make sure to pick another talent in the talent row. Your choices are <SpellLink id={this.option1} /> or <SpellLink id={this.option2} />.</span>).icon(ITEMS.SOUL_OF_THE_HUNTMASTER.icon).staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
    });
  }
}

export default SoulOfTheHuntmaster;
