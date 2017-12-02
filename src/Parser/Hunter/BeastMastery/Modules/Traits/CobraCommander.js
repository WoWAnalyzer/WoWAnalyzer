import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatNumber } from 'common/format';

class CobraCommander extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  summons = 0;
  cobraCommanderIDs = [];
  sneakySnakeDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.COBRA_COMMANDER_TRAIT.id] > 0;
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
    this.sneakySnakeDamage += event.amount;
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.COBRA_COMMANDER.id} />}
        value={`${formatNumber(this.sneakySnakeDamage)}`}
        label={this.owner.formatItemDamageDone(this.sneakySnakeDamage)} />
    );
  }

}

export default CobraCommander;
