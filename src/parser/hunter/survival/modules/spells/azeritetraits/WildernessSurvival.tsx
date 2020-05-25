import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { RAPTOR_MONGOOSE_VARIANTS } from 'parser/hunter/survival/constants';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import { DamageEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

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
  protected spellUsable!: SpellUsable;
  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.WILDERNESS_SURVIVAL.id);
    if (this.selectedCombatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id)) {
      this.hasWFI = true;
    }
  }

  get effectiveCDRInSeconds() {
    return (this.effectiveWSReductionMs / 1000).toFixed(1);
  }
  get totalPossibleCDR() {
    return ((this.effectiveWSReductionMs + this.wastedWSReductionMs) / 1000).toFixed(1);
  }
  checkCooldown(spellId: number) {
    if (this.spellUsable.cooldownRemaining(spellId) < MS_REDUCTION) {
      const effectiveReductionMs = this.spellUsable.reduceCooldown(spellId, MS_REDUCTION);
      this.effectiveWSReductionMs += effectiveReductionMs;
      this.wastedWSReductionMs += (MS_REDUCTION - effectiveReductionMs);
    } else {
      this.effectiveWSReductionMs += this.spellUsable.reduceCooldown(spellId, MS_REDUCTION);
    }
  }
  on_byPlayer_damage(event: DamageEvent) {
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
  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            Wilderness Survival reduced {this.hasWFI ? SPELLS.WILDFIRE_INFUSION_TALENT.name : SPELLS.WILDFIRE_BOMB.name} by {this.effectiveCDRInSeconds} seconds out of {this.totalPossibleCDR} possible.
          </>
        )}
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
      >
        <BoringSpellValueText spell={SPELLS.WILDERNESS_SURVIVAL}>
          <>
            {this.effectiveCDRInSeconds}/{this.totalPossibleCDR}s <small>effective CDR</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WildernessSurvival;
