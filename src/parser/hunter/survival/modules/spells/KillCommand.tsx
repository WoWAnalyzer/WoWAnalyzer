import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Events, { ApplyBuffEvent } from 'parser/core/Events';

/**
 * Give the command to kill, causing your pet to savagely deal [Attack power * 0.6 * (1 + Versatility)] Physical damage to the enemy.
 * Has a 25% chance to immediately reset its cooldown.
 * Generates 15 Focus
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/dHcVrvbMX39xNAC8#fight=3&type=auras&source=66&ability=259285
 */
class KillCommand extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
    globalCooldown: GlobalCooldown,
  };

  resets = 0;

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;
  protected globalCooldown!: GlobalCooldown;

  constructor(options: any) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLANKERS_ADVANTAGE), this.onFlankersProc);
  }

  onFlankersProc(event: ApplyBuffEvent) {
    if (!this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_SV.id)) {
      return;
    }
    this.resets += 1;
    const globalCooldown = this.globalCooldown.getGlobalCooldownDuration(event.ability.guid);
    const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(SPELLS.KILL_COMMAND_CAST_SV.id, this.spellUsable.cooldownTriggerEvent(SPELLS.KILL_COMMAND_CAST_SV.id));
    if (expectedCooldownDuration) {
      this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_SV.id, expectedCooldownDuration - globalCooldown);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(18)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.KILL_COMMAND_CAST_SV}>
          <>
            {this.resets} <small>{this.resets === 1 ? 'reset' : 'resets'}</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default KillCommand;
