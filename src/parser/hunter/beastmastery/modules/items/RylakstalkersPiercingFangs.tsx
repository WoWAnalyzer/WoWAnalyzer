import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import HIT_TYPES from 'game/HIT_TYPES';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { RYLAKSTALKERS_PIERCING_FANGS_CRIT_DMG_INCREASE } from 'parser/hunter/beastmastery/constants';
import ItemDamageDone from 'interface/ItemDamageDone';

/**
 * While Bestial Wrath is active, your pet's critical damage dealt is increased by 20%.
 *
 * Example log:
 *
 */
class RylakstalkersPiercingFangs extends Analyzer {

  damage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.RYLAKSTALKERS_PIERCING_FANGS_EFFECT.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  onPetDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, RYLAKSTALKERS_PIERCING_FANGS_CRIT_DMG_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.RYLAKSTALKERS_PIERCING_FANGS_EFFECT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RylakstalkersPiercingFangs;
