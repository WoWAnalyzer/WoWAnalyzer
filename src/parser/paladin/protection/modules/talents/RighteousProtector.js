import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';

export const REDUCTION_TIME = 3000; // ms

/**
 * Shield of the Righteous reduces the remaining cooldown on Light of the Protector and Avenging Wrath by 3 sec.
 */
class RighteousProtector extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RIGHTEOUS_PROTECTOR_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS), this.onCast);
  }

  lightOfTheProtectorReduced = 0;
  lightOfTheProtectorReductionWasted = 0;
  avengingWrathReduced = 0;
  avengingWrathReductionWasted = 0;
  onCast(event) {
    let LOTP_ID = SPELLS.LIGHT_OF_THE_PROTECTOR.id;
    if (this.selectedCombatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id)) {
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
    const lotpName = this.selectedCombatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id) ? 'Hand of the Protector' : 'Light of the Protector';
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RIGHTEOUS_PROTECTOR_TALENT.id} />}
        value={`${ this.avengingWrathReduced / 1000 } sec`}
        label="Righteous Protector CDR"
        tooltip={(
          <>
            Avenging Wrath reduction: {this.avengingWrathReduced / 1000}s ({this.avengingWrathReductionWasted / 1000}s wasted)<br />
            {lotpName} reduction: {(this.lightOfTheProtectorReduced / 1000).toFixed(0)}s ({(this.lightOfTheProtectorReductionWasted / 1000).toFixed(0)}s wasted)
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default RighteousProtector;
