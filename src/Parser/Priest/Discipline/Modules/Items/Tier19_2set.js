import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

const debug = false;

const HEALING_INCREASE = 0.3;

class Tier19_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.DISC_PRIEST_T19_2SET_BONUS_BUFF.id);
  }

  on_byPlayer_heal(event) {
    this.registerHeal(event);
  }
  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.POWER_WORD_SHIELD.id) {
      // PW:S gets applied but the initial application doesn't get buffed. Since it's an abosrb, any followup absorbs do NOT benefit from the set bonus, but they do occur as the buff is still up. This has to be excluded.
      return;
    }
    this.registerHeal(event);
  }
  registerHeal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }
    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      // If combatant doesn't exist it's probably a pet.
      debug && console.log('Skipping event since combatant couldn\'t be found:', event);
      return;
    }
    const hasBuff = combatant.hasBuff(SPELLS.POWER_WORD_SHIELD.id, event.timestamp);
    if (!hasBuff) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, HEALING_INCREASE);
  }

  item() {
    const healing = this.healing || 0;

    return {
      id: `spell-${SPELLS.DISC_PRIEST_T19_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.DISC_PRIEST_T19_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.DISC_PRIEST_T19_2SET_BONUS_BUFF.id} icon={false} />,
      result: <ItemHealingDone amount={healing} />,
    };
  }
}

export default Tier19_2set;
