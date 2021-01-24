import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { SpellLink } from 'interface';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Events from 'parser/core/Events';
import { Trans } from '@lingui/macro';

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
  };

  effectiveKillCommandResets = 0;
  wastedKillerCobraCobraShots = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.KILLER_COBRA_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COBRA_SHOT), this.onCobraCast);
  }

  get wastedKillerCobraThreshold() {
    return {
      actual: this.wastedKillerCobraCobraShots,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onCobraCast() {
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    const killCommandIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND_CAST_BM.id);
    if (killCommandIsOnCooldown) {
      this.spellUsable.endCooldown(SPELLS.KILL_COMMAND_CAST_BM.id);
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
            {this.effectiveKillCommandResets}/{this.effectiveKillCommandResets + this.wastedKillerCobraCobraShots} <small>{this.effectiveKillCommandResets + this.wastedKillerCobraCobraShots === 1 ? 'reset' : 'resets'}</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.wastedKillerCobraThreshold).addSuggestion((suggest, actual, recommended) => suggest(<>Avoid casting <SpellLink id={SPELLS.COBRA_SHOT.id} /> whilst <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> isn't on cooldown, when you have <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> up. Utilize the reset effect of <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} /> by only casting <SpellLink id={SPELLS.COBRA_SHOT.id} /> to reset <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> when <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> is up. </>)
      .icon(SPELLS.KILLER_COBRA_TALENT.icon)
      .actual(<Trans id='hunter.beastmastery.suggestions.killerCobra.efficiency'> You cast Cobra Shot while Kill Command wasn't on cooldown, whilst Bestial Wrath was up {actual} times. </Trans>)
      .recommended(<Trans id='hunter.beastmastery.suggestions.killerCobra.recommended'>{recommended} is recommended.</Trans>));
  }
}

export default KillerCobra;
