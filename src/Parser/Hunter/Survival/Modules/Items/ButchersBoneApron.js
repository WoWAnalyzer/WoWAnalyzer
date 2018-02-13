import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';

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
  usedStacks = 0;
  butcheryCarveCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.BUTCHERS_BONE_APRON.id);
  }

  on_byPlayer_cast(event) {
    const spellID = event.ability.guid;
    if (spellID === SPELLS.MONGOOSE_BITE.id && this._currentStacks === MAX_STACKS) {
      this.wastedStacks++;
      this.totalStacks++;
    }
    if (spellID === SPELLS.BUTCHERY_TALENT.id || spellID === SPELLS.CARVE.id) {
      this._savedStacks = this._currentStacks;
      this.usedStacks += this._currentStacks;
      this.butcheryCarveCasts++;
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

  get apronStacks() {
    return this._currentStacks;
  }

  get percentCappedStacks() {
    return this.wastedStacks / this.totalStacks;
  }

  get unusedStacks() {
    return this.totalStacks - this.usedStacks - this.wastedStacks;
  }

  get unusedStacksThreshold() {
    return {
      actual: this.unusedStacks,
      isGreaterThan: {
        minor: 2.9,
        average: 5.9,
        major: 8.9,
      },
      style: 'number',
    };
  }

  get cappedStacksThreshold() {
    return {
      actual: this.percentCappedStacks,
      isGreaterThan: {
        minor: 0,
        average: 0.05,
        major: 0.1,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    const spellLinkId = this.combatants.selected.hasTalent(SPELLS.BUTCHERY_TALENT.id) ? SPELLS.BUTCHERY_TALENT.id : SPELLS.CARVE.id;

    when(this.cappedStacksThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You lost out on {this.wastedStacks} (or {formatPercentage(this.percentCappedStacks)}% of total stacks) chest stacks because you were capped. You should try and avoid this by casting a <SpellLink id={spellLinkId} icon /> when you're at {MAX_STACKS} stacks. </Wrapper>)
        .icon(ITEMS.BUTCHERS_BONE_APRON.icon)
        .actual(`${this.wastedStacks} or ${formatPercentage(actual)}% of total stacks were wasted due to overcapping`)
        .recommended(`${recommended}% is recommended`);
    });
    when(this.unusedStacksThreshold).addSuggestion((suggest, actual) => {
      return suggest(<Wrapper>You finished the encounter with {this.unusedStacks} stacks unused, try and utilise all of your stacks to get the most out of your equipped legendary and <SpellLink id={spellLinkId} icon />.</Wrapper>)
        .icon(ITEMS.BUTCHERS_BONE_APRON.icon)
        .actual(`${(actual)} stacks were unused`)
        .recommended(`0 unused stacks is recommended`);
    });
  }

  item() {
    const spellLinkName = this.combatants.selected.hasTalent(SPELLS.BUTCHERY_TALENT.id) ? SPELLS.BUTCHERY_TALENT.name : SPELLS.CARVE.name;
    return {
      item: ITEMS.BUTCHERS_BONE_APRON,
      result: (
        <dfn data-tip={`You applied the Butchers Bone Apron buff ${(this.totalStacks - this.wastedStacks)} times, and wasted ${this.wastedStacks} stacks by casting Mongoose Bite while you were already at 10 stacks. <br/> You had an average of ${(this.usedStacks / this.butcheryCarveCasts).toFixed(1)} stacks of the Butchers Bone Apron buff when casting ${spellLinkName}.`}>
          <ItemDamageDone amount={this.bonusDamage} />
        </dfn>
      ),
    };
  }
}

export default ButchersBoneApron;
