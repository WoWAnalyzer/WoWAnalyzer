import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { RAPTOR_MONGOOSE_VARIANTS } from 'parser/hunter/survival/constants';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import Events from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

/**
 * Raptor Strike (or Mongoose Bite) deals an additional 27 damage and reduces the remaining cooldown of Wildfire Bomb by 1.0 sec.
 *
 * Example report:
 * https://www.warcraftlogs.com/reports/NTvPJdrFgYchAX1R#fight=6&type=summary&source=27
 */

const MS_REDUCTION = 1000;

class WildernessSurvival extends Analyzer {

  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveWSReductionMs = 0;
  wastedWSReductionMs = 0;
  bombSpellKnown = SPELLS.WILDFIRE_BOMB;

  protected spellUsable!: SpellUsable;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.WILDERNESS_SURVIVAL.id);
    if (this.selectedCombatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id)) {
      this.bombSpellKnown = SPELLS.WILDFIRE_INFUSION_TALENT;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(RAPTOR_MONGOOSE_VARIANTS), this.onDamage);
  }

  get effectiveCDRInSeconds() {
    return this.effectiveWSReductionMs / 1000;
  }

  get totalPossibleCDR() {
    return (this.effectiveWSReductionMs + this.wastedWSReductionMs) / 1000;
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

  onDamage() {
    if (this.spellUsable.isOnCooldown(this.bombSpellKnown.id)) {
      this.checkCooldown(this.bombSpellKnown.id);
    } else {
      this.wastedWSReductionMs += MS_REDUCTION;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            Wilderness Survival reduced {this.bombSpellKnown.name} by {this.effectiveCDRInSeconds.toFixed(1)} seconds out of {this.totalPossibleCDR.toFixed(1)} possible.
          </>
        )}
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
      >
        <BoringSpellValueText spell={SPELLS.WILDERNESS_SURVIVAL}>
          <>
            {this.effectiveCDRInSeconds.toFixed(1)}/{this.totalPossibleCDR}s <small>effective CDR</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WildernessSurvival;
