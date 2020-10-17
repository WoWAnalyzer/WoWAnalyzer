import React from 'react';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import Abilities from '../Abilities';
import Events from 'parser/core/Events';

class BlackOxBrew extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  cdr = {
    [SPELLS.PURIFYING_BREW.id]: 0,
    [SPELLS.CELESTIAL_BREW.id]: 0,
  };
  wastedCDR = {
    [SPELLS.PURIFYING_BREW.id]: 0,
    [SPELLS.CELESTIAL_BREW.id]: 0,
  };
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLACK_OX_BREW_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACK_OX_BREW_TALENT), this.onCast);
  }

  _trackCdr(spellId) {
    const cd = this.spellUsable.cooldownRemaining(spellId);
    this.cdr[spellId] += cd;
    const wastedCDR = this.abilities.getExpectedCooldownDuration(spellId, this.spellUsable.cooldownTriggerEvent(spellId)) - cd;
    this.wastedCDR[spellId] += wastedCDR;
  }

  _resetPB() {
    // loop until we've reset all the charges individually, recording
    // the amount of cooldown reduction for each charge.
    const spellId = SPELLS.PURIFYING_BREW.id;
    while(this.spellUsable.isOnCooldown(spellId)) {
      this._trackCdr(spellId);
      this.spellUsable.endCooldown(spellId, false);
    }
  }

  _resetCB() {
    const spellId = SPELLS.CELESTIAL_BREW.id;
    if(this.spellUsable.isOnCooldown(spellId)) {
      this._trackCdr(spellId);
      this.spellUsable.endCooldown(spellId, false);
    } else {
      this.wastedCDR[spellId] = this.abilities.getExpectedCooldownDuration(spellId, this.spellUsable.cooldownTriggerEvent(spellId));
    }
  }

  onCast(event) {
    this.casts += 1;

    this._resetPB();
    this._resetCB();
  }

  get suggestionThreshold() {
    return {
      actual: this.wastedCDR / (this.cdr + this.wastedCDR),
      isGreaterThan: {
        minor: 0.10,
        average: 0.2,
        major: 0.3,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThreshold)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} /> usage can be improved.</>)
          .icon(SPELLS.BLACK_OX_BREW_TALENT.icon)
          .actual(i18n._(t('monk.brewmaster.suggestions.blackOxBrew.cdrWasted')`${formatPercentage(actual)}% of Cooldown Reduction wasted`))
          .recommended(`< ${formatPercentage(recommended)}% is recommended`));
  }
}

export default BlackOxBrew;
