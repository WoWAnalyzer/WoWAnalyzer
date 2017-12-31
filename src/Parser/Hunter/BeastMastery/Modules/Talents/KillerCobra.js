import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import { formatNumber } from 'common/format';
import Haste from 'Parser/Core/Modules/Haste';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import SpellLink from 'common/SpellLink';

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
        value={this.effectiveKillCommandResets}
        label="Kill Command Resets"
        tooltip={`You wasted ${formatNumber(this.wastedKillerCobraCobraShots)} Cobra Shots in Bestial Wrath by using them while Kill Command wasn't on cooldown. </br> `}
      />
    );
  }

  get wastedKillerCobraThreshold() {
    return {
      actual: this.wastedKillerCobraCobraShots,
      isGreaterThan: {
        minor: 0,
        average: 0.9,
        major: 1.9,
      },
      style: 'number',
    };
  }
  suggestions(when) {
    const {
      isGreaterThan: {
        minor,
        average,
        major,
      },
    } = this.wastedKillerCobraThreshold;
    when(this.wastedKillerCobraCobraShots).isGreaterThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Avoid casting <SpellLink id={SPELLS.COBRA_SHOT.id} /> whilst <SpellLink id={SPELLS.KILL_COMMAND.id} /> isn't on cooldown, when you have <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> up. Utilize the reset effect of <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} /> by only casting <SpellLink id={SPELLS.COBRA_SHOT.id} /> to reset <SpellLink id={SPELLS.KILL_COMMAND.id} /> when <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> is up. </span>)
          .icon(SPELLS.KILLER_COBRA_TALENT.icon)
          .actual(`You cast Cobra Shot while Kill Command wasn't on cooldown, whilst Bestial Wrath was up ${this.wastedKillerCobraCobraShots} times.`)
          .recommended(`${recommended} is recommended.`)
          .regular(average)
          .major(major);
      });
  }
}

export default KillerCobra;
