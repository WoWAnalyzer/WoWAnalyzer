import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from "common/SpellIcon";
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Main/ItemDamageDone';

class CobraCommander extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  summons = 0;
  cobraCommanderIDs = [];
  sneakySnakeDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.COBRA_COMMANDER_TRAIT.id];
  }

  on_byPlayer_summon(event) {
    const summonId = event.ability.guid;
    if (summonId !== SPELLS.COBRA_COMMANDER.id) {
      return;
    }
    this.cobraCommanderIDs.push({
      ID: event.targetID,
      instance: event.targetInstance,
    });
    this.summons += 1;
  }

  on_byPlayerPet_damage(event) {
    const index = this.cobraCommanderIDs.findIndex(sneakySnake => sneakySnake.ID === event.sourceID && sneakySnake.instance === event.sourceInstance);
    const selectedSneakySnake = this.cobraCommanderIDs[index];
    if (!selectedSneakySnake) {
      return;
    }
    this.sneakySnakeDamage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.COBRA_COMMANDER.id}>
            <SpellIcon id={SPELLS.COBRA_COMMANDER.id} noLink /> Sneaky Snakes
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.sneakySnakeDamage} />
        </div>
      </div>
    );
  }

}

export default CobraCommander;
