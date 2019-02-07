import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import React from 'react';
import SpellLink from 'common/SpellLink';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events from 'parser/core/Events';

const GS_BASE_COOLDOWN_TIME = (60 * 3) * 1000;
const GS_MODIFIED_COOLDOWN_TIME = (60 + 10) * 1000; // one minute plus 10 seconds to account for the duration of the buff.

// Example Log: /report/mFarpncVW9ALwTq4/7-Mythic+Zek'voz+-+Kill+(8:52)/14-Praydien
class GuardianAngel extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  get guardianSpiritCastCount() {
    return this.abilityTracker.getAbility(SPELLS.GUARDIAN_SPIRIT.id).casts;
  }
  guardianSpiritRemovalCount = 0;
  guardianSpiritHealCount = 0;
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

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUARDIAN_ANGEL_TALENT.id);

    if (!this.active) {
      return;
    }
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_SPIRIT), this._parseGsRemove);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_SPIRIT), this._parseGsHeal);
  }

  _parseGsRemove(event) {
    this.guardianSpiritRemovalCount += 1;
  }

  _parseGsHeal(event) {
    this.guardianSpiritHealCount += 1;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.GUARDIAN_ANGEL_TALENT.id}
        value={
          <>
            {this.guardianSpiritRefreshCount} &nbsp;
            <SpellLink id={SPELLS.GUARDIAN_SPIRIT.id} /> resets
          </>
        }
        tooltip={`
          You casted Guardian Spirit ${this.gsValue} more times than you would have been able to without Guardian Angel.<br />
          You could have theoretically cast Guardian Spirit ${this.gsGuardianSpiritCastsPossible - this.guardianSpiritCastCount} more times.
        `}
        position={STATISTIC_ORDER.CORE(3)}
      />

    );
  }
}

export default GuardianAngel;
