import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

/**
 * Cobra Shot has a 10% chance to create 2-4 Sneaky Snakes that attack the target for 6 sec.
 */
class CobraCommander extends Analyzer {
  summons = 0;
  cobraCommanderIDs = [];
  sneakySnakeDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.traitsBySpellId[SPELLS.COBRA_COMMANDER_TRAIT.id];
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
            Sneaky Snakes
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
