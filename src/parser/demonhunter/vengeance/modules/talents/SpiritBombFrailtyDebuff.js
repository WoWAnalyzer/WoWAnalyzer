import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { formatPercentage, formatThousands, formatDuration } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import UptimeIcon from 'interface/icons/Uptime';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { t } from '@lingui/macro';

class SpiritBombFrailtyDebuff extends Analyzer {
  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.90,
        average: 0.85,
        major: .80,
      },
      style: 'percentage',
    };
  }

  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id);
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id} /> uptime can be improved. This is easy to maintain and an important source of healing.</>)
        .icon(SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.icon)
        .actual(t({
      id: "demonhunter.vengeance.spiritBombFrailtyBuff.uptime",
      message: `${formatPercentage(actual)}% Frailty uptime`
    }))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    const spiritBombUptime = this.enemies.getBuffUptime(SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id);
    const spiritBombDamage = this.abilityTracker.getAbility(SPELLS.SPIRIT_BOMB_DAMAGE.id).damageEffective;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Total damage was {formatThousands(spiritBombDamage)}.<br />
            Total uptime was {formatDuration(spiritBombUptime / 1000)}.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SPIRIT_BOMB_TALENT}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SpiritBombFrailtyDebuff;
