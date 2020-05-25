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

class ThunderaansFury extends Analyzer {
  /**
   *
   * Stormstrike deals additional damage, and has a 8% chance to summon
   * Thunderaan's Fury Totem, doubling the chance to activate Windfury Weapon
   * for 6 sec.
   *
   * TODO: Encount for the Thunderaan's Fury Totem effect.
   *
   * Example Log:
   *
   */

  protected damageGained = 0;
  protected bonusDamage = 0;

  constructor(options: any) {
    super(options);
    if (!this.selectedCombatant.hasTrait(SPELLS.THUNDERAANS_FURY.id)) {
      this.active = false;
      return;
    }

    this.bonusDamage
      = this.selectedCombatant.traitsBySpellId[SPELLS.THUNDERAANS_FURY.id]
      .reduce((total, rank) => {
        const [damage] = calculateAzeriteEffects(
          SPELLS.THUNDERAANS_FURY.id,
          rank,
        );
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
    this.damageGained += this.bonusDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={'Only Stormstrike statistics are currently shown.'}
      >
        <BoringSpellValueText spell={SPELLS.THUNDERAANS_FURY}>
          <ItemDamageDone amount={this.damageGained} approximate />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ThunderaansFury;
