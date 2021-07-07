import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { RYLAKSTALKERS_PIERCING_FANGS_CRIT_DMG_INCREASE } from '@wowanalyzer/hunter-beastmastery/src/constants';

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
    this.active = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.RYLAKSTALKERS_PIERCING_FANGS_EFFECT.bonusID,
    );
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
        <BoringSpellValueText spellId={SPELLS.RYLAKSTALKERS_PIERCING_FANGS_EFFECT.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RylakstalkersPiercingFangs;
