import React from 'react';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { STORMSTRIKE_CAST_SPELLS } from 'parser/shaman/enhancement/constants';
import { calculateAzeriteEffects } from 'common/stats';

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

    if (!this.selectedCombatant.hasTrait(SPELLS.ROILING_STORM.id)) {
      this.active = false;
      return;
    }

    this.bonusDamage = this.selectedCombatant.traitsBySpellId[SPELLS.ROILING_STORM.id]
      .reduce((total, rank) => {
        const [damage] = calculateAzeriteEffects(SPELLS.ROILING_STORM.id, rank);
        return total + damage;
      }, 0);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(STORMSTRIKE_CAST_SPELLS),
      this.onStrikeCast,
    );
  }

  // We do this on cast since the damage is split amongst the two hits.
  onStrikeCast(event: CastEvent) {
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
        category={STATISTIC_CATEGORY.ITEMS}
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
