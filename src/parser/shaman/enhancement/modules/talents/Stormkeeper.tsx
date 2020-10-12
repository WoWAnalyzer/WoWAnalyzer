import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'parser/core/Analyzer';
import { DamageEvent } from 'parser/core/Events';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';

const AFFECTED_ABILITIES = [SPELLS.LIGHTNING_BOLT_OVERLOAD.id,
  SPELLS.LIGHTNING_BOLT.id,
  SPELLS.CHAIN_LIGHTNING_OVERLOAD.id,
  SPELLS.CHAIN_LIGHTNING.id];

/**
 * Charge yourself with lightning, causing your next 2 Lightning Bolts
 * or Chain Lightnings to deal 150% more damage and be instant cast.
 *
 * Example Log:
 *
 */
class Stormkeeper extends Analyzer {
  protected damageDoneByBuffedCasts: number = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STORMKEEPER_TALENT_ENHANCEMENT.id);
  }

  on_byPlayer_damage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMKEEPER_TALENT_ENHANCEMENT.id)){
      return;
    }

    if (!AFFECTED_ABILITIES.includes(event.ability.guid)) {
      return;
    }
    this.damageDoneByBuffedCasts += event.amount;
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageDoneByBuffedCasts);
  }

  get damagePerSecond() {
    return this.damageDoneByBuffedCasts / (this.owner.fightDuration / 1000);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Buffed casts contributed ${formatNumber(this.damageDoneByBuffedCasts)} damage (${formatPercentage(this.damagePercent)}% of your damage)`}
      >
        <BoringSpellValueText spell={SPELLS.STORMKEEPER_TALENT_ENHANCEMENT}>
          <>
            <ItemDamageDone amount={this.damageDoneByBuffedCasts} /><br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormkeeper;
