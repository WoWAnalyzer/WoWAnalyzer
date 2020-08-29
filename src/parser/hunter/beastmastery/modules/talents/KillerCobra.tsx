import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SpellLink from 'common/SpellLink';
import GlobalCooldown from 'parser/hunter/beastmastery/modules/core/GlobalCooldown';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { CastEvent } from 'parser/core/Events';

/**
 * While Bestial Wrath is active, Cobra Shot resets the cooldown on Kill
 * Command.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/M8dWYrRvmbnADCcZ#fight=11&type=damage-done&source=169
 *
 */

class KillerCobra extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,
  };

  effectiveKillCommandResets = 0;
  wastedKillerCobraCobraShots = 0;

  protected spellUsable!: SpellUsable;
  protected globalCooldown!: GlobalCooldown;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.KILLER_COBRA_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COBRA_SHOT), this.onCobraCast);
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

  onCobraCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    const killCommandIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_BM.id);
    if (killCommandIsOnCooldown) {
      const globalCooldown = this.globalCooldown.getGlobalCooldownDuration(SPELLS.COBRA_SHOT.id);
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
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.KILLER_COBRA_TALENT}>
          <>
            {this.effectiveKillCommandResets}/{this.effectiveKillCommandResets + this.wastedKillerCobraCobraShots} <small>{this.effectiveKillCommandResets === 1 ? 'reset' : 'resets'}</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: any) {
    when(this.wastedKillerCobraThreshold).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>Avoid casting <SpellLink id={SPELLS.COBRA_SHOT.id} /> whilst <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> isn't on cooldown, when you have <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> up. Utilize the reset effect of <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} /> by only casting <SpellLink id={SPELLS.COBRA_SHOT.id} /> to reset <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> when <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> is up. </>)
        .icon(SPELLS.KILLER_COBRA_TALENT.icon)
        .actual(`You cast Cobra Shot while Kill Command wasn't on cooldown, whilst Bestial Wrath was up ${actual} times.`)
        .recommended(`${recommended} is recommended.`);
    });
  }
}

export default KillerCobra;
