import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemHealingDone from 'interface/ItemHealingDone';

/**
 * When your health is brought below 35%, you instantly heal for 20% of your maximum health.
 * Cannot occur more than once every 45 sec.
 *
 * Example log:
 */
class NaturesGuardian extends Analyzer {
  protected healthGained: number = 0;
  protected procCount: number = 0;

  constructor(options: any) {
    super(options);

    if(!this.selectedCombatant.hasTalent(SPELLS.NATURES_GUARDIAN_TALENT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER)
        .spell(SPELLS.NATURES_GUARDIAN_HEAL),
      this.onNaturesGuardianHeal,
    );
  }

  onNaturesGuardianHeal(event: HealEvent) {
    this.procCount += 1;
    this.healthGained += event.amount;
  }

  // TODO: add proc count to statistics
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(999)}
        size="small"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.NATURES_GUARDIAN_TALENT}>
          <>
            <ItemHealingDone amount={this.healthGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NaturesGuardian;
