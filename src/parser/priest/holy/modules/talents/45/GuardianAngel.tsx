import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

const GS_BASE_COOLDOWN_TIME = (60 * 3) * 1000;
const GS_MODIFIED_COOLDOWN_TIME = (60 + 10) * 1000; // one minute plus 10 seconds to account for the duration of the buff.

// Example Log: /report/mFarpncVW9ALwTq4/7-Mythic+Zek'voz+-+Kill+(8:52)/14-Praydien
class GuardianAngel extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  guardianSpiritRemovalCount = 0;
  guardianSpiritHealCount = 0;
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUARDIAN_ANGEL_TALENT.id);

    if (!this.active) {
      return;
    }
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_SPIRIT), this._parseGsRemove);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_SPIRIT), this._parseGsHeal);
  }

  get guardianSpiritCastCount() {
    return this.abilityTracker.getAbility(SPELLS.GUARDIAN_SPIRIT.id).casts;
  }

  get guardianSpiritRefreshCount() {
    return this.guardianSpiritRemovalCount - this.guardianSpiritHealCount;
  }

  get baseGuardianSpiritCastsPossible() {
    return Math.floor(this.owner.fightDuration / GS_BASE_COOLDOWN_TIME);
  }

  get gsGuardianSpiritCastsPossible() {
    return Math.floor(this.owner.fightDuration / GS_MODIFIED_COOLDOWN_TIME);
  }

  get gsValue() {
    const castDelta = this.guardianSpiritCastCount - this.baseGuardianSpiritCastsPossible;
    return (castDelta) >= 0 ? (castDelta) : 0;
  }

  _parseGsRemove() {
    this.guardianSpiritRemovalCount += 1;
  }

  _parseGsHeal() {
    this.guardianSpiritHealCount += 1;
  }

  statistic() {
    return (
      <Statistic
        tooltip={(
          <>
            You casted Guardian Spirit {this.gsValue} more times than you would have been able to without Guardian Angel.<br />
            You could have theoretically cast Guardian Spirit {this.gsGuardianSpiritCastsPossible - this.guardianSpiritCastCount} more times.
          </>
        )}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(3)}
      >
        <BoringSpellValueText spell={SPELLS.GUARDIAN_ANGEL_TALENT}>
          {this.guardianSpiritRefreshCount} Guardian Spirit resets<br />
          {this.guardianSpiritHealCount} Guardian Spirits consumed
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GuardianAngel;
