import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';
import Wrapper from 'common/Wrapper';

class AspectOfTheBeast extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ASPECT_OF_THE_BEAST_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ASPECT_OF_THE_BEAST_BESTIAL_FEROCITY.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }
  get aspectOfTheBeastDamageThreshold() {
    return {
      actual: this.damage,
      isLessThan: {
        minor: 3,
        average: 2,
        major: 1,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    const {
      isLessThan: {
        minor,
        average,
        major,
      },
    } = this.aspectOfTheBeastDamageThreshold;
    when(this.damage).isLessThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper><SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} /> had no damage contribution, which indiciates you did not have your pet specced into Ferocity, which it should always be.</Wrapper>)
          .icon(SPELLS.ASPECT_OF_THE_BEAST_TALENT.icon)
          .actual(`Aspect of the Beast did no additional damage`)
          .recommended(`Speccing your pet into Ferocity is recommended`)
          .regular(average)
          .major(major);
      });
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id}>
            <SpellIcon id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} noLink /> Bestial Ferocity
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default AspectOfTheBeast;
