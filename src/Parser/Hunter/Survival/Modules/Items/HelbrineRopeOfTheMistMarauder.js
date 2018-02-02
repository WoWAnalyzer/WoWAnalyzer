import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';
import Enemies from 'Parser/Core/Modules/Enemies';
import ItemDamageDone from 'Main/ItemDamageDone';
import GetDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';

/**
 * Helbrine, Rope of the Mist Marauder
 * Equip: The first time Harpoon hits a target, your damage done to the target is increased by up to 30% for until cancelled based on distance to the target.
 */

//TODO - do precise damage calculations for Helbrine based on positioning after in-game testing (if possible at all)

const MAX_MODIFIER = 0.3;

class HelbrineRopeOfTheMistMarauder extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  applications = 0;
  bonusDamage = 0;
  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.HELBRINE_ROPE_OF_THE_MIST_MARAUDER.id);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.MARK_OF_HELBRINE.id) / this.owner.fightDuration;
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MARK_OF_HELBRINE.id) {
      return;
    }
    this.applications++;
  }

  on_byPlayer_damage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    if (enemy.hasBuff(SPELLS.MARK_OF_HELBRINE.id, event.timestamp)) {
      this.bonusDamage += GetDamageBonus(event, MAX_MODIFIER);
    }
  }

  item() {
    return {
      item: ITEMS.HELBRINE_ROPE_OF_THE_MIST_MARAUDER,
      result: (
        <dfn data-tip={`You applied the Mark of Helbrine debuff ${this.applications} times. </br> The reason this shows as "up to X dmg" is because the tooltip has no information on the potency of the applied Mark of Helbrine. To maximize the potential of this legendary, you want to stand as far away as possible and cast Harpoon when engaging the first time with mobs.`}>
          <Wrapper>
            {formatPercentage(this.uptimePercentage)}% uptime<br />
            Up to <ItemDamageDone amount={this.bonusDamage} />
          </Wrapper>
        </dfn>
      ),
    };
  }
}

export default HelbrineRopeOfTheMistMarauder;
