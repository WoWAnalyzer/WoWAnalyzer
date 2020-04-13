import React from 'react';
import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ItemHealingDone from 'interface/ItemHealingDone';

class NaturesGuardian extends Analyzer {
  /**
   * When your health is brought below 35%, you instantly heal for 20% of your maximum health.
   * Cannot occur more than once every 45 sec.
   *
   * Example log:
   */

  protected healthGained = 0;
  protected procCount = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NATURES_GUARDIAN_TALENT.id);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER)
        .spell(SPELLS.NATURES_GUARDIAN_HEAL),
      this.onNaturesGuardianHeal,
    );
  }

  onNaturesGuardianHeal(event: HealEvent) {
    this.procCount++;
    this.healthGained += event.amount;
  }

  // TODO: add proc count to statistics
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(999)}
        size="small"
        category={'TALENTS'}
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
