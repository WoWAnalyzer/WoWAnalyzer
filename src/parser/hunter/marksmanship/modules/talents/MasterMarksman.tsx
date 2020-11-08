import React from 'react';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'interface/ItemDamageDone';

/**
 * Your ranged special attack critical strikes cause the target to bleed for an additional 15% of the damage dealt over 6 sec.
 *
 * Example log:
 *
 */

class MasterMarksman extends Analyzer {

  damage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_MARKSMAN_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MASTER_MARKSMAN_DEBUFF), this.onDebuffDamage);
  }

  onDebuffDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.MASTER_MARKSMAN_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MasterMarksman;
