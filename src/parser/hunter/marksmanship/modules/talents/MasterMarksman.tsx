import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { DamageEvent } from 'parser/core/Events';
import HIT_TYPES from 'game/HIT_TYPES';
import ItemDamageDone from 'interface/ItemDamageDone';

/**
 * Your ranged special attack critical strikes cause the target to bleed for an additional 15% of the damage dealt over 6 sec.
 *
 * Example log:
 *
 * TODO: If the current implementation of this stays throughout the beta, add something tracking damage lost to overriding the debuff
 */

class MasterMarksman extends Analyzer {

  dotApplications: number = 0;
  damage: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_MARKSMAN_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onGenericDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MASTER_MARKSMAN_DEBUFF), this.onDebuffDamage);

  }

  onGenericDamage(event: DamageEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    const spellID = event.ability.guid;
    if (spellID === SPELLS.AUTO_SHOT.id) {
      return;
    }
    this.dotApplications += 1;
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
        tooltip={(
          <>
            You applied a fresh DOT {this.dotApplications} times.
          </>
        )}
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
