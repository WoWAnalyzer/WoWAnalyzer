import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';

/**
 * @property {AbilityTracker} abilityTracker
 * @property {SpellUsable} spellUsable
 */
class DivinePurpose extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  holyShockProcs = 0;
  holyShockProcStreak = 0;
  highestHolyShockProcStreak = 0;
  lightOfDawnProcs = 0;
  lightOfDawnProcStreak = 0;
  highestLightOfDawnProcStreak = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id);
    // Holy Shock
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF), this._onHolyShockDivinePurposeProc);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF), this._onHolyShockDivinePurposeProc);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_SHOCK_CAST), this._onHolyShockCast);
    // Light of Dawn
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_LIGHT_OF_DAWN_BUFF), this._onLightOfDawnDivinePurposeProc);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.DIVINE_PURPOSE_LIGHT_OF_DAWN_BUFF), this._onLightOfDawnDivinePurposeProc);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN_CAST), this._onLightOfDawnCast);
  }

  _onHolyShockDivinePurposeProc() {
    this.holyShockProcs += 1;
    if (this.spellUsable.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id)) {
      this.spellUsable.endCooldown(SPELLS.HOLY_SHOCK_CAST.id);
    }
  }
  _onHolyShockCast() {
    if (this.selectedCombatant.hasBuff(SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF.id)) {
      this.holyShockProcStreak += 1;
      this.highestHolyShockProcStreak = Math.max(this.highestHolyShockProcStreak, this.holyShockProcStreak);
    } else {
      // When we cast a regular (unbuffed) HS, it's outside of a streak.
      this.holyShockProcStreak = 0;
    }
  }

  _onLightOfDawnDivinePurposeProc() {
    this.lightOfDawnProcs += 1;
    if (this.spellUsable.isOnCooldown(SPELLS.LIGHT_OF_DAWN_CAST.id)) {
      this.spellUsable.endCooldown(SPELLS.LIGHT_OF_DAWN_CAST.id);
    }
  }
  _onLightOfDawnCast() {
    if (this.selectedCombatant.hasBuff(SPELLS.DIVINE_PURPOSE_LIGHT_OF_DAWN_BUFF.id)) {
      this.lightOfDawnProcStreak += 1;
      this.highestLightOfDawnProcStreak = Math.max(this.highestLightOfDawnProcStreak, this.lightOfDawnProcStreak);
    } else {
      // When we cast a regular (unbuffed) LoD, it's outside of a streak.
      this.lightOfDawnProcStreak = 0;
    }
  }

  statistic() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const lightOfDawnCast = getAbility(SPELLS.LIGHT_OF_DAWN_CAST.id);
    const holyShockHeal = getAbility(SPELLS.HOLY_SHOCK_HEAL.id);

    const lightOfDawnHeals = lightOfDawnCast.casts || 0;
    const holyShockHeals = holyShockHeal.healingHits || 0;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(75)}
        icon={<SpellIcon id={SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id} />}
        value={(
          <div className="flex">
            <div className="flex-sub content-middle" style={{ marginRight: 5 }}>
              <SpellIcon
                id={SPELLS.HOLY_SHOCK_CAST.id}
                style={{
                  height: '1.3em',
                  marginTop: '-.1em',
                }}
              />
            </div>
            <div className="flex-main">
              {this.holyShockProcs} <small>{formatPercentage(this.holyShockProcs / (holyShockHeals - this.holyShockProcs))}%</small><br />
              <small>Best streak: {this.highestHolyShockProcStreak}x</small>
            </div>
            <div className="flex-sub content-middle" style={{ marginRight: 5 }}>
              <SpellIcon
                id={SPELLS.LIGHT_OF_DAWN_CAST.id}
                style={{
                  height: '1.3em',
                  marginTop: '-.1em',
                }}
              />
            </div>
            <div className="flex-main">
              {this.lightOfDawnProcs} <small>{formatPercentage(this.lightOfDawnProcs / (lightOfDawnHeals - this.lightOfDawnProcs))}%</small><br />
              <small>Best streak: {this.highestLightOfDawnProcStreak}x</small>
            </div>
          </div>
        )}
        label="Divine Purpose procs"
      />
    );
  }
}

export default DivinePurpose;
