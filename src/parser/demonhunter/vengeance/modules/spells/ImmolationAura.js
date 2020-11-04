import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage, formatThousands, formatDuration } from 'common/format';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import UptimeIcon from 'interface/icons/Uptime';

class ImmolationAura extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  statistic() {
    const immolationAuraUptime = this.selectedCombatant.getBuffUptime(SPELLS.IMMOLATION_AURA.id);

    const immolationAuraUptimePercentage = immolationAuraUptime / this.owner.fightDuration;

    this.immolationAuraDamage = this.abilityTracker.getAbility(SPELLS.IMMOLATION_AURA_FIRST_STRIKE.id).damageEffective + this.abilityTracker.getAbility(SPELLS.IMMOLATION_AURA.id).damageEffective;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        tooltip={
          <>
            The Immolation Aura total damage was {formatThousands(this.immolationAuraDamage)}.<br />
            The Immolation Aura total uptime was {formatDuration(immolationAuraUptime / 1000)}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.IMMOLATION_AURA}>
          <>
            <UptimeIcon /> {formatPercentage(immolationAuraUptimePercentage)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ImmolationAura;
