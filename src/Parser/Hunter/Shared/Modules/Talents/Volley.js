import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from "common/SpellLink";

class Volley extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  damage = 0;
  volleyRemoved = -1;
  volleyApplied = 0;
  deaths = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.VOLLEY_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VOLLEY_ACTIVATED.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  on_byPlayer_removebuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.VOLLEY_TALENT.id) {
      return;
    }
    this.volleyRemoved += 1;
  }

  on_toPlayer_death() {
    this.deaths += 1;
    this.volleyRemoved -= 1;
  }

  on_byPlayer_applybuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.VOLLEY_TALENT.id) {
      return;
    }
    this.volleyApplied += 1;
  }

  suggestions(when) {
    when(this.volleyRemoved).isGreaterThan(0)
      .addSuggestion((suggest) => {
        return suggest(<span>It looks like you turned <SpellLink id={SPELLS.VOLLEY_TALENT.id} /> off during the encounter, this should never be done. <SpellLink id={SPELLS.VOLLEY_TALENT.id} /> should always be active, no matter what. </span>)
          .icon(SPELLS.VOLLEY_TALENT.icon)
          .actual(`Volley was toggled off ${this.volleyRemoved} times`)
          .recommended(`Volley should never be turned off`)
          .major(0);
      });
    when(this.volleyApplied).isLessThan(this.deaths)
      .addSuggestion((suggest) => {
        return suggest(<span>It looks like you forgot to turn <SpellLink id={SPELLS.VOLLEY_TALENT.id} /> on again after dying. <SpellLink id={SPELLS.VOLLEY_TALENT.id} /> should always be active, no matter what. </span>)
          .icon(SPELLS.VOLLEY_TALENT.icon)
          .actual(`You died ${this.deaths} time(s), and toggled Volley on ${this.volleyApplied} times.`)
          .recommended(`Remember to toggle Volley back on after dying`)
          .major(this.volleyApplied < this.deaths);
      });

  }
  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.VOLLEY_TALENT.id}>
            <SpellIcon id={SPELLS.VOLLEY_TALENT.id} noLink /> Volley
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {(this.owner.formatItemDamageDone(this.damage))}
        </div>
      </div>
    );
  }

}

export default Volley;
