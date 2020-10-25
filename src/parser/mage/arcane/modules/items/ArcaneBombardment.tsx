import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const HEALTH_THRESHOLD = .35;
const DAMAGE_BONUS = .8;

class ArcaneBombardment extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  }
  protected abilityTracker!: AbilityTracker;

  bonusDamage: number = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.ARCANE_BOMBARDMENT.bonusID);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE), this.onBarrageDamage);
  }

  onBarrageDamage(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return;
    }
    const enemyHealth = event.hitPoints / event.maxHitPoints;
    if (enemyHealth <= HEALTH_THRESHOLD) {
      this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS);
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.ARCANE_BOMBARDMENT}>
          <ItemDamageDone amount={this.bonusDamage} /><br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneBombardment;
