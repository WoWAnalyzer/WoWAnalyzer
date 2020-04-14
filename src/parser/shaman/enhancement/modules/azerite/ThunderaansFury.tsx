import React from 'react';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import Events from 'parser/core/Events';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { STORMSTRIKE_DAMAGE_SPELLS } from 'parser/shaman/enhancement/constants';
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
    this.active = this.selectedCombatant.hasTrait(SPELLS.THUNDERAANS_FURY.id);

    if (!this.active) {
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
      Events.damage.by(SELECTED_PLAYER)
        .spell(STORMSTRIKE_DAMAGE_SPELLS),
      this.onStrikeDamage,
    );
  }

  onStrikeDamage() {
    this.damageGained += this.bonusDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={'AZERITE_POWERS'}
        tooltip={'Only Stormstrike statistics are shown.'}
      >
        <BoringSpellValueText spell={SPELLS.THUNDERAANS_FURY}>
          <ItemDamageDone amount={this.damageGained} approximate />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ThunderaansFury;
