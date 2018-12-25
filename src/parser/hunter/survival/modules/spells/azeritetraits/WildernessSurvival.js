import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS/index';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { RAPTOR_MONGOOSE_VARIANTS } from 'parser/hunter/survival/constants';

/**
 * Raptor Strike (or Mongoose Bite) deals an additional 27 damage and reduces the remaining cooldown of Wildfire Bomb by 1.0 sec.
 *
 * Example report: https://www.warcraftlogs.com/reports/Xr7Nxjd1KnMT9QBf/#fight=1&source=13&type=summary
 */

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
    return (this.effectiveWSReductionMs / 1000).toFixed(1);
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
    if (!RAPTOR_MONGOOSE_VARIANTS.includes(spellId)) {
      return;
    }
    if (this.hasWFI) {
      if (this.spellUsable.isOnCooldown(SPELLS.WILDFIRE_INFUSION_TALENT.id)) {
        this.checkCooldown(SPELLS.WILDFIRE_INFUSION_TALENT.id);
      } else {
        this.wastedWSReductionMs += MS_REDUCTION;
      }
    } else {
      if (this.spellUsable.isOnCooldown(SPELLS.WILDFIRE_BOMB.id)) {
        this.checkCooldown(SPELLS.WILDFIRE_BOMB.id);
      } else {
        this.wastedWSReductionMs += MS_REDUCTION;
      }
    }
  }

  get totalPossibleCDR() {
    return ((this.effectiveWSReductionMs + this.wastedWSReductionMs) / 1000).toFixed(1);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.WILDERNESS_SURVIVAL.id}
        value={`${this.effectiveCDRInSeconds}/${this.totalPossibleCDR}s effective CDR`}
        tooltip={`Wilderness Survival reduced ${this.hasWFI ? SPELLS.WILDFIRE_INFUSION_TALENT.name : SPELLS.WILDFIRE_BOMB.name} by ${this.effectiveCDRInSeconds} seconds out of ${this.totalPossibleCDR} possible.`}
      />
    );
  }
}

export default WildernessSurvival;
