import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const T204P_MODIFIER = 0.15;

const debug = false;

/**
 * Cobra Shot, Multi-Shot, and Kill Command deal 15% increased damage while Bestial Wrath is active.
 */

class Tier20_4p extends Analyzer {
  bonusDmg = 0;
  bestialWrathBaseModifier = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.HUNTER_BM_T20_4P_BONUS.id);
    if (this.selectedCombatant.hasTalent(SPELLS.BESTIAL_FURY_TALENT) || this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_HUNTMASTER.id)) {
      this.bestialWrathBaseModifier = 0.4;
    } else {
      this.bestialWrathBaseModifier = 0.25;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    if (spellId !== SPELLS.MULTISHOT.id && spellId !== SPELLS.COBRA_SHOT.id) {
      return;
    }
    debug && console.log(`player cast spell: `, spellId);
    this.bonusDmg += getDamageBonus(event, T204P_MODIFIER);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id, event.timestamp)) {
      return;
    }
    if (spellId !== SPELLS.KILL_COMMAND_PET.id) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, T204P_MODIFIER);
  }
  item() {
    return {
      id: `spell-${SPELLS.HUNTER_BM_T20_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_BM_T20_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_BM_T20_4P_BONUS.id} icon={false} />,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default Tier20_4p;
