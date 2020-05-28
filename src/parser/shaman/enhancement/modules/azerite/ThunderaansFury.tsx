import React from 'react';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { STORMSTRIKE_CAST_SPELLS, STORMSTRIKE_COEFFICIENT, STORMSTRIKE_DAMAGE_SPELLS } from 'parser/shaman/enhancement/constants';
import { calculateAzeriteEffects } from 'common/stats';
import StatTracker from 'parser/shared/modules/StatTracker';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';

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
class ThunderaansFury extends Analyzer {
  protected damageGained: number = 0;
  protected bonusDamage: number = 0;
  protected lastAttackPower: number = 0;

  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  constructor(options: any) {
    super(options);

    if (!this.selectedCombatant.hasTrait(SPELLS.THUNDERAANS_FURY.id)) {
      this.active = false;
      return;
    }

    this.bonusDamage = this.selectedCombatant.traitsBySpellId[SPELLS.THUNDERAANS_FURY.id]
      .reduce((total, rank) => {
        return total + calculateAzeriteEffects(SPELLS.THUNDERAANS_FURY.id, rank)[0];
      }, 0);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(STORMSTRIKE_CAST_SPELLS),
      this.onStrikeCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(STORMSTRIKE_DAMAGE_SPELLS),
      this.onStrikeDamage,
    );
  }

  onStrikeCast(event: CastEvent) {
    this.lastAttackPower = event.attackPower || 0;
  }

  onStrikeDamage(event: DamageEvent) {
    // Determine between off-hand or main hand attack.
    const scale = (event.ability.guid === SPELLS.STORMSTRIKE_DAMAGE_OFFHAND.id || event.ability.guid === SPELLS.WINDSTRIKE_DAMAGE_OFFHAND.id) ? 1/3 : 2/3;

    const [damage] = calculateBonusAzeriteDamage(event,[this.bonusDamage * scale], this.lastAttackPower, STORMSTRIKE_COEFFICIENT);
    this.damageGained += damage;
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
