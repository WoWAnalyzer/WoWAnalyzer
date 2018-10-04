import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS/index';
import SpellUsable from 'parser/core/modules/SpellUsable';

/**
 * Raptor Strike (or Mongoose Bite) deals an additional 27 damage and reduces the remaining cooldown of Wildfire Bomb by 1.0 sec.
 *
 * Example report: https://www.warcraftlogs.com/reports/Xr7Nxjd1KnMT9QBf/#fight=1&source=13&type=summary
 */

const TRIGGERING_SPELLS = [
  SPELLS.MONGOOSE_BITE_TALENT.id,
  SPELLS.MONGOOSE_BITE_TALENT_AOTE.id,
  SPELLS.RAPTOR_STRIKE.id,
  SPELLS.RAPTOR_STRIKE_AOTE.id,
];

const MS_REDUCTION = 1000;

class WildernessSurvival extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveWSReductionMs = 0;
  wastedWSReductionMs = 0;
  hasWFI = false;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.WILDERNESS_SURVIVAL.id);
    if (this.selectedCombatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id)) {
      this.hasWFI = true;
    }
  }

  get effectiveCDRInSeconds() {
    return this.effectiveWSReductionMs / 1000;
  }

  get wastedCDRInSeconds() {
    return this.wastedWSReductionMs / 1000;
  }

  checkCooldown(spellId) {
    if (this.spellUsable.cooldownRemaining(spellId) < MS_REDUCTION) {
      const effectiveReductionMs = this.spellUsable.reduceCooldown(spellId, MS_REDUCTION);
      this.effectiveWSReductionMs += effectiveReductionMs;
      this.wastedWSReductionMs += (MS_REDUCTION - effectiveReductionMs);
    } else {
      this.effectiveWSReductionMs += this.spellUsable.reduceCooldown(spellId, MS_REDUCTION);
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!TRIGGERING_SPELLS.includes(spellId)) {
      return;
    }

    if (this.hasWFI) {
      if (this.spellUsable.isOnCooldown(SPELLS.WILDFIRE_INFUSION_TALENT.id)) {
        this.checkCooldown(SPELLS.WILDFIRE_INFUSION_TALENT.id);
      } else {
        this.wastedWSReductionMs += MS_REDUCTION;
      }
    }
    if (this.spellUsable.isOnCooldown(SPELLS.WILDFIRE_BOMB.id)) {
      this.checkCooldown(SPELLS.WILDFIRE_BOMB.id);
    } else {
      this.wastedWSReductionMs += MS_REDUCTION;
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.WILDERNESS_SURVIVAL.id}
        value={`${this.effectiveCDRInSeconds}/${this.effectiveCDRInSeconds + this.wastedCDRInSeconds}s`}
        tooltip={`Wilderness Survival reduced ${this.hasWFI ? SPELLS.WILDFIRE_INFUSION_TALENT.name : SPELLS.WILDFIRE_BOMB.name} by ${this.effectiveCDRInSeconds} seconds out of ${this.effectiveCDRInSeconds + this.wastedCDRInSeconds} possible.`}
      />
    );
  }
}

export default WildernessSurvival;
