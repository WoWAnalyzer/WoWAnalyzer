import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import SPELLS from 'common/SPELLS/index';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

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
//Just using 1 of the WFI bombs, since it'll reduce for all 3 and it's impossible to determine which one is next from the logs
    }
  }

  get effectiveCDRInSeconds() {
    return this.effectiveWSReductionMs / 1000;
  }

  get wastedCDRInSeconds() {
    return this.wastedWSReductionMs / 1000;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!TRIGGERING_SPELLS.includes(spellId)) {
      return;
    }
    if (this.hasWFI) {
      if (this.spellUsable.isOnCooldown(SPELLS.VOLATILE_BOMB_WFI.id)) {
        if (this.spellUsable.cooldownRemaining(SPELLS.VOLATILE_BOMB_WFI.id) < MS_REDUCTION) {
          const effectiveReductionMs = this.spellUsable.reduceCooldown(SPELLS.VOLATILE_BOMB_WFI.id, MS_REDUCTION);
          this.effectiveWSReductionMs += effectiveReductionMs;
          this.wastedWSReductionMs += (MS_REDUCTION - effectiveReductionMs);
        } else {
          this.effectiveWSReductionMs += this.spellUsable.reduceCooldown(SPELLS.VOLATILE_BOMB_WFI.id, MS_REDUCTION);
        }
        return;
      } else if (this.spellUsable.isOnCooldown(SPELLS.PHEROMONE_BOMB_WFI.id)) {
        if (this.spellUsable.cooldownRemaining(SPELLS.PHEROMONE_BOMB_WFI.id) < MS_REDUCTION) {
          const effectiveReductionMs = this.spellUsable.reduceCooldown(SPELLS.PHEROMONE_BOMB_WFI.id, MS_REDUCTION);
          this.effectiveWSReductionMs += effectiveReductionMs;
          this.wastedWSReductionMs += (MS_REDUCTION - effectiveReductionMs);
        } else {
          this.effectiveWSReductionMs += this.spellUsable.reduceCooldown(SPELLS.PHEROMONE_BOMB_WFI.id, MS_REDUCTION);
        }
        return;
      } else if (this.spellUsable.isOnCooldown(SPELLS.SHRAPNEL_BOMB_WFI.id)) {
        if (this.spellUsable.cooldownRemaining(SPELLS.SHRAPNEL_BOMB_WFI.id) < MS_REDUCTION) {
          const effectiveReductionMs = this.spellUsable.reduceCooldown(SPELLS.SHRAPNEL_BOMB_WFI.id, MS_REDUCTION);
          this.effectiveWSReductionMs += effectiveReductionMs;
          this.wastedWSReductionMs += (MS_REDUCTION - effectiveReductionMs);
        } else {
          this.effectiveWSReductionMs += this.spellUsable.reduceCooldown(SPELLS.SHRAPNEL_BOMB_WFI.id, MS_REDUCTION);
        }
        return;
      } else {
        this.wastedWSReductionMs += MS_REDUCTION;
      }
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.WILDFIRE_BOMB.id)) {
      if (this.spellUsable.cooldownRemaining(SPELLS.WILDFIRE_BOMB.id) < MS_REDUCTION) {
        const effectiveReductionMs = this.spellUsable.reduceCooldown(SPELLS.WILDFIRE_BOMB.id, MS_REDUCTION);
        this.effectiveWSReductionMs += effectiveReductionMs;
        this.wastedWSReductionMs += (MS_REDUCTION - effectiveReductionMs);
      } else {
        this.effectiveWSReductionMs += this.spellUsable.reduceCooldown(SPELLS.WILDFIRE_BOMB.id, MS_REDUCTION);
      }
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
