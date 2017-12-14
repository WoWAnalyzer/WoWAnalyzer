import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';

const WAY_OF_THE_COBRA_MODIFIER = 0.1;

// We'll always have main pet and hati out
const MINIMUM_PETS = 2;

class WayOfTheCobra extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;
  amountOfSummons = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.WAY_OF_THE_COBRA_TALENT.id);
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_BEAST_BUFF.id) {
      return;
    }
    this.amountOfSummons += 1;
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_BEAST_BUFF.id) {
      return;
    }
    this.amountOfSummons -= 1;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COBRA_SHOT.id) {
      return;
    }
    this.damage += getDamageBonus(event, WAY_OF_THE_COBRA_MODIFIER * (this.amountOfSummons + MINIMUM_PETS));
  }

  subStatistic() {
    if (this.damage > 0) {
      return (
        <div className="flex">
          <div className="flex-main">
            <SpellLink id={SPELLS.WAY_OF_THE_COBRA_TALENT.id}>
              <SpellIcon id={SPELLS.WAY_OF_THE_COBRA_TALENT.id} noLink /> Way of the Cobra
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

export default WayOfTheCobra;
