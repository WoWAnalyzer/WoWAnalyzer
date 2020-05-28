import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

/**
 * Crash Lightning also electrifies the ground, leaving an electrical
 * field behind which damages enemies within it for
 * [7 * (2.688% of Attack power)] Nature damage over 6 sec.
 *
 * Example Log:
 *
 */

class CrashingStorm extends Analyzer {
  protected damageGained: number = 0;

  constructor(options: any) {
    super(options);

    if(!this.selectedCombatant.hasTalent(SPELLS.CRASHING_STORM_TALENT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.CRASHING_STORM_TALENT),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.damageGained += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.CRASHING_STORM_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CrashingStorm;
