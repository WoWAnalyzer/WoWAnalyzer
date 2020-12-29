import React from 'react';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import { t } from '@lingui/macro';

import Abilities from '../Abilities';

class BlackOxBrew extends Analyzer {
  get suggestionThreshold() {
    return {
      actual:
        this.wastedCDR[SPELLS.PURIFYING_BREW.id] /
        (this.cdr[SPELLS.PURIFYING_BREW.id] + this.wastedCDR[SPELLS.PURIFYING_BREW.id]),
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };
  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  cdr = {
    [SPELLS.PURIFYING_BREW.id]: 0,
    [SPELLS.CELESTIAL_BREW.id]: 0,
  };
  wastedCDR = {
    [SPELLS.PURIFYING_BREW.id]: 0,
    [SPELLS.CELESTIAL_BREW.id]: 0,
  };
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLACK_OX_BREW_TALENT.id);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACK_OX_BREW_TALENT),
      this.onCast,
    );
  }

  _trackCdr(spellId: number) {
    const cd = this.spellUsable.cooldownRemaining(spellId);
    this.cdr[spellId] += cd;

    const expectedCooldown = this.abilities.getExpectedCooldownDuration(
      spellId,
      this.spellUsable.cooldownTriggerEvent(spellId),
    );
    if (expectedCooldown) {
      const wastedCDR = expectedCooldown - cd;
      this.wastedCDR[spellId] += wastedCDR;
    }
  }

  _resetPB() {
    // loop until we've reset all the charges individually, recording
    // the amount of cooldown reduction for each charge.
    const spellId = SPELLS.PURIFYING_BREW.id;
    while (this.spellUsable.isOnCooldown(spellId)) {
      this._trackCdr(spellId);
      this.spellUsable.endCooldown(spellId, false);
    }
  }

  _resetCB() {
    const spellId = SPELLS.CELESTIAL_BREW.id;
    if (this.spellUsable.isOnCooldown(spellId)) {
      this._trackCdr(spellId);
      this.spellUsable.endCooldown(spellId, false);
    } else {
      this.wastedCDR[spellId] += this.abilities.getExpectedCooldownDuration(spellId) || 0;
    }
  }

  onCast(event: CastEvent) {
    this.casts += 1;

    this._resetPB();
    this._resetCB();
  }

  suggestions(when: When) {
    when(this.suggestionThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} /> usage can be improved.
        </>,
      )
        .icon(SPELLS.BLACK_OX_BREW_TALENT.icon)
        .actual(
          t({
            id: 'monk.brewmaster.suggestions.blackOxBrew.cdrWasted',
            message: `${formatPercentage(actual)}% of Cooldown Reduction wasted`,
          }),
        )
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default BlackOxBrew;
