import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

/**
 * Increases the damage of your pet's abilities by 30%.
 * Increases the effectiveness of your pet's Predator's Thirst, Endurance Training, and Pathfinding passives by 50%.
 *
 * Example log: https://www.warcraftlogs.com/reports/htGc4Vp8QJ6XTW72#fight=1&type=damage-done&source=13
 */

const ASPECT_MULTIPLIER = 0.3;

class AspectOfTheBeast extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ASPECT_OF_THE_BEAST_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.MELEE.id || spellId === SPELLS.KILL_COMMAND_DAMAGE_BM.id || spellId === SPELLS.STOMP_DAMAGE.id) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, ASPECT_MULTIPLIER);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} />}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
}

export default AspectOfTheBeast;
