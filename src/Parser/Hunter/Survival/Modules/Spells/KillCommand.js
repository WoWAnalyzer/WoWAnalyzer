import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Interface/Others/StatisticBox';
import Abilities from 'Parser/Core/Modules/Abilities';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

/**
 * Give the command to kill, causing your pet to savagely deal [Attack power * 0.6 * (1 + Versatility)] Physical damage to the enemy.
 *
 * Survival (Level 50) - Has a 25% chance to immediately reset its cooldown
 */

class KillCommand extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  resets = 0;
  resetWhileNotOnCD = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KILL_COMMAND_SV.id) {
      return;
    }
    this.casts++;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLANKERS_ADVANTAGE.id) {
      return;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_SV.id)) {
      this.resetWhileNotOnCD++;
      return;
    }
    this.resets++;
    this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_SV.id, this.abilities.getExpectedCooldownDuration(SPELLS.KILL_COMMAND_SV.id));
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(18)}
        icon={<SpellIcon id={SPELLS.KILL_COMMAND_SV.id} />}
        value={`${this.resets}`}
        label="Kill Command resets"
        tooltip={`You had ${this.resetWhileNotOnCD} resets whilst Kill Command was not on cooldown`}
      />
    );
  }
}

export default KillCommand;
