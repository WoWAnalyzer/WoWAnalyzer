import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import SpellLink from 'common/SpellLink';
import StatTracker from 'parser/shared/modules/StatTracker';
import GlobalCooldown from 'parser/hunter/beastmastery/modules/core/GlobalCooldown';

/**
 * While Bestial Wrath is active, Cobra Shot resets the cooldown on Kill Command.
 *
 * Example log: https://www.warcraftlogs.com/reports/daqtD36LCTR4MQrc#fight=6&type=damage-done&source=73
 */

class KillerCobra extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,
    statTracker: StatTracker,
  };

  effectiveKillCommandResets = 0;
  wastedKillerCobraCobraShots = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.KILLER_COBRA_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    if (spellId !== SPELLS.COBRA_SHOT.id) {
      return;
    }
    const killCommandIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_BM.id);
    if (killCommandIsOnCooldown) {
      const globalCooldown = this.globalCooldown.getGlobalCooldownDuration(spellId);
      const cooldownToReduceWith = this.spellUsable.cooldownRemaining(SPELLS.KILL_COMMAND_CAST_BM.id) - globalCooldown;
      //using this instead of endCooldown to ensure it doesn't negatively affect cast efficiency when resetting with Killer Cobra
      this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND_CAST_BM.id, cooldownToReduceWith);
      this.effectiveKillCommandResets += 1;
    } else {
      this.wastedKillerCobraCobraShots += 1;
    }
  }
  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.KILLER_COBRA_TALENT.id}
        value={this.effectiveKillCommandResets}
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
    when(this.wastedKillerCobraThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Avoid casting <SpellLink id={SPELLS.COBRA_SHOT.id} /> whilst <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> isn't on cooldown, when you have <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> up. Utilize the reset effect of <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} /> by only casting <SpellLink id={SPELLS.COBRA_SHOT.id} /> to reset <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> when <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> is up. </>)
        .icon(SPELLS.KILLER_COBRA_TALENT.icon)
        .actual(`You cast Cobra Shot while Kill Command wasn't on cooldown, whilst Bestial Wrath was up ${actual} times.`)
        .recommended(`${recommended} is recommended.`);
    });
  }
}

export default KillerCobra;
