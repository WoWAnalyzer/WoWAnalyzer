import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const REDUCTION_TIME = 3000; // ms

/**
 * Shield of the Righteous reduces the remaining cooldown on Light of the Protector and Avenging Wrath by 3 sec.
 */
class RighteousProtector extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.RIGHTEOUS_PROTECTOR_TALENT.id);
  }

  lightOfTheProtectorReduced = 0;
  lightOfTheProtectorReductionWasted = 0;
  avengingWrathReduced = 0;
  avengingWrathReductionWasted = 0;
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHIELD_OF_THE_RIGHTEOUS.id) {
      return;
    }

    let LOTP_ID = SPELLS.LIGHT_OF_THE_PROTECTOR.id;
    if (this.combatants.selected.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id)) {
      LOTP_ID = SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id;
    }

    if (this.spellUsable.isOnCooldown(LOTP_ID)) {
      const reduction = this.spellUsable.reduceCooldown(LOTP_ID, REDUCTION_TIME);
      this.lightOfTheProtectorReduced += reduction;
      this.lightOfTheProtectorReductionWasted += REDUCTION_TIME - reduction;
    } else {
      this.lightOfTheProtectorReductionWasted += REDUCTION_TIME;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.AVENGING_WRATH.id)) {
      const reduction = this.spellUsable.reduceCooldown(SPELLS.AVENGING_WRATH.id, REDUCTION_TIME);
      this.avengingWrathReduced += reduction;
      this.avengingWrathReductionWasted += REDUCTION_TIME - reduction;
    } else {
      this.avengingWrathReductionWasted += REDUCTION_TIME;
    }
  }

  statistic() {
    const lotpName = this.combatants.selected.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id) ? 'Hand of the Protector' : 'Light of the Protector';
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RIGHTEOUS_PROTECTOR_TALENT.id} />}
        value={`${ this.avengingWrathReduced / 1000 } sec`}
        label="cooldown reduction"
        tooltip={`
          Avenging Wrath reduction: ${ this.avengingWrathReduced / 1000 }s (${ this.avengingWrathReductionWasted / 1000 }s wasted)<br/>
          ${ lotpName } reduction: ${ (this.lightOfTheProtectorReduced / 1000).toFixed(0) }s (${ (this.lightOfTheProtectorReductionWasted / 1000).toFixed(0) }s wasted)
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default RighteousProtector;
