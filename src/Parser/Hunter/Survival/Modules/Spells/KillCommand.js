import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import StatisticBox from 'Interface/Others/StatisticBox';
import Abilities from 'Parser/Core/Modules/Abilities';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

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

  hasAlphaPredator = false;
  resets = 0;

  constructor(...args) {
    super(...args);
    if (this.selectedCombatant.hasTalent(SPELLS.ALPHA_PREDATOR_TALENT.id)) {
      this.hasAlphaPredator = true;
    }
  }

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
    if (this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_SV.id)) {
      this.resets++;
      if (this.hasAlphaPredator) {
        const newChargeCDR = this.abilities.getExpectedCooldownDuration(SPELLS.KILL_COMMAND_SV.id) - this.spellUsable.cooldownRemaining(SPELLS.KILL_COMMAND_SV.id);
        this.spellUsable.endCooldown(SPELLS.KILL_COMMAND_SV.id, false, event.timestamp, newChargeCDR);
      } else {
        this.spellUsable.endCooldown(SPELLS.KILL_COMMAND_SV.id);
      }
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.KILL_COMMAND_SV.id} />}
        value={`${this.resets}`}
        label="Kill Command Resets"
      />
    );
  }
}

export default KillCommand;
