import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const T20_2P_MODIFIER_PR_STACK = 0.015;

const debug = false;

/**
 * Cobra Shot, Multi-shot, and Kill Command increase the damage bonus of Bestial Wrath by 1.5% for its remaining duration.
 */

class Tier20_2p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;
  bestialWrathBaseModifier = 0;
  currentStacks = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_BM_T20_2P_BONUS.id);
    if (this.combatants.selected.hasTalent(SPELLS.BESTIAL_FURY_TALENT) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id)) {
      this.bestialWrathBaseModifier = 0.4;
    } else {
      this.bestialWrathBaseModifier = 0.25;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BESTIAL_WRATH.id) {
      this.currentStacks = 0;
      debug && console.log('Bestial Wrath Cast and currentStacks = ', this.currentStacks);
    }
    if (spellId !== SPELLS.COBRA_SHOT.id && spellId !== SPELLS.KILL_COMMAND.id && spellId !== SPELLS.MULTISHOT.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      this.currentStacks += 1;
      debug && console.log('t20 buffer cast and stacks = ', this.currentStacks);
    }
  }

  on_byPlayer_damage(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, (this.currentStacks * T20_2P_MODIFIER_PR_STACK) / (1 + this.bestialWrathBaseModifier));
  }

  on_byPlayerPet_damage(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, (this.currentStacks * T20_2P_MODIFIER_PR_STACK) / (1 + this.bestialWrathBaseModifier));
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_BM_T20_2P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_BM_T20_2P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_BM_T20_2P_BONUS.id} icon={false} />,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default Tier20_2p;
