import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import { formatNumber } from 'common/format';
import Haste from 'Parser/Core/Modules/Haste';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";


class KillerCobra extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
    haste: Haste,
  };

  effectiveKillCommandResets = 0;
  wastedKillerCobraCobraShots = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.KILLER_COBRA_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    if (spellId !== SPELLS.COBRA_SHOT.id) {
      return;
    }
    const killCommandIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND.id);
    if (killCommandIsOnCooldown) {
      this.spellUsable.endCooldown(SPELLS.KILL_COMMAND.id);
      this.effectiveKillCommandResets += 1;
    } else {
      this.wastedKillerCobraCobraShots += 1;
    }
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.KILLER_COBRA_TALENT.id} />}
        value={`${this.effectiveKillCommandResets}`}
        label={`Kill Command Resets`}
        tooltip={`You wasted ${formatNumber(this.wastedKillerCobraCobraShots)} Cobra Shots in Bestial Wrath by using them while Kill Command wasn't on cooldown. </br> `}
      />
    );
  }
}

export default KillerCobra;
