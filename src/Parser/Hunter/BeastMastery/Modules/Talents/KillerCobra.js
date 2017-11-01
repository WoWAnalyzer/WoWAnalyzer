import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import { formatNumber } from 'common/format';
import Haste from 'Parser/Core/Modules/Haste';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";

//Setting it to base cooldown of Kill Command - this works as Killer Cobra gives a total reset regardless of remaining CD.
const COOLDOWN_REDUCTION_MS = 7500;

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
      this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND.id, COOLDOWN_REDUCTION_MS);
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
