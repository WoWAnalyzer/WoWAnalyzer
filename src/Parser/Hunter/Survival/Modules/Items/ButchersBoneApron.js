import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Butcher's Bone Apron
 * Equip: Mongoose Bite increases the damage of your next Butchery or Carve by 10%.
 * Stacks up to 10 times.
 */

const MAX_STACKS = 10;

const MODIFIER_PER_STACK = 0.1;

class ButchersBoneApron extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _currentStacks = 0;
  _savedStacks = 0;
  wastedStacks = 0;
  bonusDamage = 0;
  totalStacks = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.BUTCHERS_BONE_APRON.id);
  }

  on_byPlayer_cast(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.MONGOOSE_BITE.id && this._currentStacks === MAX_STACKS) {
      this.wastedStacks++;
    }
    if (spellID === SPELLS.BUTCHERY_TALENT.id || spellID === SPELLS.CARVE.id) {
      this._savedStacks = this._currentStacks;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.BUTCHERS_BONE_APRON_BUFF.id) {
      return;
    }
    this._currentStacks = 1;
    this._savedStacks = 0;
    this.totalStacks++;
  }

  on_byPlayer_applybuffstack(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.BUTCHERS_BONE_APRON_BUFF.id) {
      return;
    }
    this._currentStacks = event.stack;
    this.totalStacks++;

  }

  on_byPlayer_removebuff(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.BUTCHERS_BONE_APRON_BUFF.id) {
      return;
    }
    this._currentStacks = 0;
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.BUTCHERY_TALENT.id && spellID !== SPELLS.CARVE.id) {
      return;
    }
    this.bonusDamage += getDamageBonus(event, MODIFIER_PER_STACK * this._savedStacks);
  }

  item() {
    return {
      item: ITEMS.BUTCHERS_BONE_APRON,
      result: (
        <dfn data-tip={`You applied the Butchers Bone Apron buff ${this.totalStacks} times, and wasted ${this.wastedStacks} stacks by casting Mongoose Bite while you were already at 10 stacks.`}>
          <ItemDamageDone amount={this.bonusDamage} />
        </dfn>
      ),
    };
  }
}

export default ButchersBoneApron;
