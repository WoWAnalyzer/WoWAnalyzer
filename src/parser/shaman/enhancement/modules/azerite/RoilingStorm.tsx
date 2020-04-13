import React from 'react';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import Events, { DamageEvent } from 'parser/core/Events';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { STORMBRINGER_DAMAGE_SPELLS } from 'parser/shaman/enhancement/modules/core/Stormbringer';
import { calculateAzeriteEffects } from '../../../../../common/stats';

class RoilingStorm extends Analyzer {
  /**
   * Your Stormbringer-empowered Stormstrikes deal 2220 additional damage.
   * Every 20 seconds, gain Stormbringer
   *
   * Note: This does not appear as a buff.
   * Every Stormstrike will deal extra damage as long as its under the effect
   * of Stormbringer.
   *
   * Example Log:
   *
   */

  protected damageGained = 0;
  protected bonusDamage = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.ROILING_STORM.id);

    this.bonusDamage = this.selectedCombatant.traitsBySpellId[SPELLS.ROILING_STORM.id]
      .reduce((total, rank) => {
        const [ damage ] = calculateAzeriteEffects(SPELLS.ROILING_STORM.id, rank);
        return total + damage;
      }, 0);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(STORMBRINGER_DAMAGE_SPELLS),
      this.onStrikeDamage,
    );
  }

  onStrikeDamage() {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMBRINGER_BUFF.id)) {
      return;
    }

    this.damageGained += this.bonusDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={'AZERITE_POWERS'}
      >
        <BoringSpellValueText spell={SPELLS.ROILING_STORM}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RoilingStorm;
