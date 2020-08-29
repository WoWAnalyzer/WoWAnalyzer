import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import HolyPowerTracker from 'parser/paladin/retribution/modules/holypower/HolyPowerTracker';

const CAST_BUFFER = 500;

class Crusade extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    globalCooldown: GlobalCooldown,
    holyPowerTracker: HolyPowerTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CRUSADE_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRUSADE_TALENT), this.onCrusadeCast);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.CRUSADE_TALENT), this.onCrusadeBuffStack);
  }

  crusadeCastTimestamp = 0;
  badFirstGlobal = 0;
  gcdBuffer = 0;

  onCrusadeCast(event) {
    this.crusadeCastTimestamp = event.timestamp;
    this.gcdBuffer = this.globalCooldown.getGlobalCooldownDuration(SPELLS.CRUSADE_TALENT.id);
    if (this.holyPowerTracker.current < 3) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Make sure to have at least 3 Holy Power before using Crusade. Ideally you should have 5 Holy Power before using Crusade after your first use.';
    }
  }

  onCrusadeBuffStack(event) {
    if (this.crusadeCastTimestamp && event.timestamp > (this.crusadeCastTimestamp + CAST_BUFFER + this.gcdBuffer)) {
      this.badFirstGlobal += 1;
    }
    this.crusadeCastTimestamp = null;
  }

  get badGlobalPercent() {
    return this.badFirstGlobal / this.abilityTracker.getAbility(SPELLS.CRUSADE_TALENT.id).casts;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.badGlobalPercent,
      isLessThan: {
        minor: 1,
        average: 0.75,
        major: 0.5,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual) => {
      return suggest(<>You want to build stacks of <SpellLink id={SPELLS.CRUSADE_TALENT.id} icon /> as quickly as possible. Make sure you are using <SpellLink id={SPELLS.TEMPLARS_VERDICT.id} icon /> or <SpellLink id={SPELLS.DIVINE_STORM.id} icon /> immediately after casting <SpellLink id={SPELLS.CRUSADE_TALENT.id} icon />.</>)
        .icon(SPELLS.CRUSADE_TALENT.icon)
        .actual(`${formatNumber(this.badFirstGlobal)} bad first global(s)`)
        .recommended(`0 is recommended`);
    });
  }
}

export default Crusade;
