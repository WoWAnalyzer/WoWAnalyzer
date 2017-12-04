import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

class AspectOfTheBeast extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_intiialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ASPECT_OF_THE_BEAST_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ASPECT_OF_THE_BEAST_BESTIAL_FEROCITY.id) {
      return;
    }
    this.damage += event.amount;
  }

  suggestions(when) {
    when(this.damage).isLessThan(1)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span><SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} /> had no damage contribution, which indiciates you did not have your pet specced into Ferocity, which it should always be.</span>)
          .icon(SPELLS.ASPECT_OF_THE_BEAST_TALENT.icon)
          .actual(`Aspect of the Beast did no additional damage`)
          .recommended(`Speccing your pet into Ferocity is recommended`)
          .major(recommended);
      });
  }

  subStatistic() {
    if (this.damage > 0) {
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id}>
              <SpellIcon id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} noLink /> Bestial Ferocity
            </SpellLink>
          </div>
          <div className="flex-sub text-right">
            {(this.owner.formatItemDamageDone(this.damage))}
          </div>
        </div>
      );
    }
  }
}

export default AspectOfTheBeast;
