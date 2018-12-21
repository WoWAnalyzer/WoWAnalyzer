import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'interface/others/StatisticBox';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

/**
 * Give the command to kill, causing your pet to savagely deal [Attack power * 0.6 * (1 + Versatility)] Physical damage to the enemy.
 * Has a 25% chance to immediately reset its cooldown.
 *
 * Generates 15 Focus
 *
 * Example log: https://www.warcraftlogs.com/reports/pNJbYdLrMW2ynKGa#fight=3&type=damage-done&source=16&translate=true
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
    if (spellId !== SPELLS.KILL_COMMAND_CAST_SV.id) {
      return;
    }
    this.casts++;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLANKERS_ADVANTAGE.id) {
      return;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_SV.id)) {
      return;
    }
    this.resets++;
    this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_SV.id, this.abilities.getExpectedCooldownDuration(SPELLS.KILL_COMMAND_CAST_SV.id));
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(18)}
        icon={<SpellIcon id={SPELLS.KILL_COMMAND_CAST_SV.id} />}
        value={`${this.resets}`}
        label="Kill Command resets"
      />
    );
  }
}

export default KillCommand;
