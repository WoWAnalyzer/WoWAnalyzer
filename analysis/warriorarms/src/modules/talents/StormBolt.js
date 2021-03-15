import { formatNumber, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import React from 'react';

/**
 * Hurls your weapon at an enemy, causing [ 16.38% of Attack Power ] Physical damage and stunning for 4 sec.
 */

class StormBolt extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  stun = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STORM_BOLT_TALENT.id);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.STORM_BOLT_TALENT_DEBUFF),
      this._onStun,
    );
  }

  _onStun() {
    this.stun += 1;
  }

  subStatistic() {
    const stormBolt = this.abilityTracker.getAbility(SPELLS.STORM_BOLT_TALENT.id);
    const total = stormBolt.damageEffective || 0;
    return (
      <StatisticListBoxItem
        title={
          <>
            <SpellLink id={SPELLS.STORM_BOLT_TALENT.id} /> Stun
          </>
        }
        value={formatNumber(this.stun)}
        valueTooltip={`Total Storm Bolt damage: ${formatThousands(total)}`}
      />
    );
  }
}

export default StormBolt;
