import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import Module from 'Parser/Core/Module';

class TheEmperorsCapacitor extends Module {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };
  totalStacks = 0;
  currentStacks = 0;
  stacksUsed = 0;
  stacksWasted = 0;
  cjlCasts = 0;
  averageStacksUsed = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.THE_EMPERORS_CAPACITOR.id);
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    // You can only ever apply 1 stack at a time
    if (SPELLS.THE_EMPERORS_CAPACITOR_STACK.id === spellId) {
      this.totalStacks += 1;
      if (this.currentStacks === 20) {
        this.stacksWasted += 1;
      }
      else {
        this.currentStacks += 1;
      }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.CRACKLING_JADE_LIGHTNING.id === spellId) {
      this.stacksUsed += this.currentStacks;
      this.currentStacks = 0;
      this.cjlCasts += 1;
      this.averageStacksUsed = this.stacksUsed / this.cjlCasts;
    }
  }

  item() {
    const cracklingJadeLightning = this.abilityTracker.getAbility(SPELLS.CRACKLING_JADE_LIGHTNING.id);
    const damage = cracklingJadeLightning.damageEffective;
    return {
      item: ITEMS.THE_EMPERORS_CAPACITOR,
      result: (<dfn data-tip={`Damage dealt does not account for opportunity cost.<br/> Stacks generated ${this.totalStacks}
        <br/>Stacks consumed: ${this.stacksUsed}<br/> Stacks wasted by generating at cap: ${this.stacksWasted}<br/> Average stacks spent on each cast: ${this.averageStacksUsed.toFixed(2)}`}>
        {this.owner.formatItemDamageDone(damage)}
      </dfn>),
    };
  }
  suggestions(when) {
    when(this.stacksWasted).isGreaterThan(0).addSuggestion((suggest, actual, recommended) => {
      return suggest(<span> You wasted your <SpellLink id={SPELLS.THE_EMPERORS_CAPACITOR_STACK.id}/> stacks by using chi spenders while at 20 stacks </span>)
        .icon(ITEMS.THE_EMPERORS_CAPACITOR.icon)
        .actual(`${this.stacksWasted} Wasted stacks`)
        .recommended(`<${(recommended)}Wasted stacks is recommended`)
        .regular(recommended + 3).major(recommended + 5);
    });
    when(this.averageStacksUsed).isLessThan(16).addSuggestion((suggest, actual, recommended) => {
      return suggest(<span> Your average number of <SpellLink id={SPELLS.THE_EMPERORS_CAPACITOR_STACK.id} /> stacks used when you cast <SpellLink id={SPELLS.CRACKLING_JADE_LIGHTNING.id}/> was low </span>)
          .icon(ITEMS.THE_EMPERORS_CAPACITOR.icon)
          .actual(`${this.averageStacksUsed.toFixed(2)} average stacks used`)
          .recommended(`Try to cast Crackling Jade Lightning while as close to 20 stacks as possible`)
          .regular(recommended - 2).major(recommended - 5);
      });
  }
}

export default TheEmperorsCapacitor;
