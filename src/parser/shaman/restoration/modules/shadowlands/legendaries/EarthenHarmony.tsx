import React from 'react';

import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemHealingDone from 'interface/ItemHealingDone';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { LegendarySpell } from 'common/SPELLS/Spell';

const HEAL_INCREASE = 1.5;
const TRIGGER_HEALTH_PERCENTAGE = .75;

/**
 * Earth Shield healing is increased by 150% if your Earth Shield target is below 75% health, and Healing Wave adds a stack of Earth Shield to your target, up to 9 maximum stacks.
 * https://www.warcraftlogs.com/reports/HPZqaj8f6cQA3CmJ#fight=18&translate=true&type=healing&source=28&ability=379&target=35&view=events
 */
class EarthenHarmony extends Analyzer {
  healing = 0;

  constructor(options: Options) {
    super(options);
    const EARTHEN_HARMONY = SPELLS.EARTHEN_HARMONY as LegendarySpell;
    this.active = this.selectedCombatant.hasLegendaryByBonusID(EARTHEN_HARMONY.bonusID ? EARTHEN_HARMONY.bonusID : 0);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EARTH_SHIELD_HEAL), this.earthShield);
  }

  earthShield(event: HealEvent) {
    const healthBeforeHeal = event.hitPoints - event.amount;
    const healthPercentage = Math.min(1, healthBeforeHeal / event.maxHitPoints);
    if (healthPercentage > TRIGGER_HEALTH_PERCENTAGE) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, HEAL_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spell={SPELLS.EARTHEN_HARMONY}>
          <ItemHealingDone amount={this.healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EarthenHarmony;
