import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

import { ABILITIES_AFFECTED_BY_MASTERY } from '../../../constants';

const COOLDOWN_REDUCTION_MS = 250;

/**
 * Meridian Strikes
 *
 * When you Combo Strike, the cooldown of Touch of Death is reduced by 0.25 sec.
 *
 * Touch of Death deals an additional 11256 damage.
 *
 * This module only handles the cooldown reduction gained through the trait
 */

class MeridianStrikes extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  lastSpellUsed = null;
  effectiveCooldownReduction = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.MERIDIAN_STRIKES.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (!ABILITIES_AFFECTED_BY_MASTERY.includes(spellId)) {
      return;
    }
    if (this.lastSpellUsed !== spellId && this.spellUsable.isOnCooldown(SPELLS.TOUCH_OF_DEATH.id)) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.TOUCH_OF_DEATH.id, COOLDOWN_REDUCTION_MS);
      this.effectiveCooldownReduction += reductionMs;
    }
    this.lastSpellUsed = spellId;
  }


  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.MERIDIAN_STRIKES.id}
        value={`${(this.effectiveCooldownReduction/1000).toFixed(2)} Seconds`}
        tooltip={`Touch of Death cooldown reduction gained through Meridian Strikes`}
      />
    );
  }
}

export default MeridianStrikes;
