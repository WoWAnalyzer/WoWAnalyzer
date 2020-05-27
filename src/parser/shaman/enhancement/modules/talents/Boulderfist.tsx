import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const ROCKBITER_DAMAGE_MODIFIER = 0.35;

/**
 * Rockbiter's recharge time is reduced by 15% and it deals 35% increased
 * damage.
 *
 * Example Log: https://www.warcraftlogs.com/reports/2YmqR6dpTLn37ahP#fight=46&type=summary
 *
 */
class Boulderfist extends Analyzer {
  protected damageGained: number = 0;

  constructor(options: any) {
    super(options);

    if(!this.selectedCombatant.hasTalent(SPELLS.BOULDERFIST_TALENT.id)) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.ROCKBITER),
      this.onRockbiterDamage,
    );
  }

  onRockbiterDamage(event: DamageEvent) {
    this.damageGained += calculateEffectiveDamage(event, ROCKBITER_DAMAGE_MODIFIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.BOULDERFIST_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Boulderfist;
