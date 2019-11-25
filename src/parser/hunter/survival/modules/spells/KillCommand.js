import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

/**
 * Give the command to kill, causing your pet to savagely deal [Attack power * 0.6 * (1 + Versatility)] Physical damage to the enemy.
 * Has a 25% chance to immediately reset its cooldown.
 *
 * Generates 15 Focus
 *
 * Example log: https://www.warcraftlogs.com/reports/pNJbYdLrMW2ynKGa#fight=3&type=damage-done&source=16&translate=true
 *
 * @property {SpellUsable} spellUsable
 * @property {Abilities} abilities
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
    this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_SV.id, this.abilities.getExpectedCooldownDuration(SPELLS.KILL_COMMAND_CAST_SV.id, this.spellUsable.cooldownTriggerEvent(SPELLS.KILL_COMMAND_CAST_SV.id)));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(18)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.KILL_COMMAND_CAST_SV}>
          <>
            {this.resets} <small>{this.resets === 0 || this.resets > 1 ? 'resets' : 'reset'}</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default KillCommand;
