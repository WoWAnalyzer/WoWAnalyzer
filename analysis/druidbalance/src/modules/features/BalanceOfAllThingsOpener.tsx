import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { t } from '@lingui/macro';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { ti } from 'make-plural';

const TARGETS_FOR_GOOD_CAST = 3;

class BalanceOfAllThingsOpener extends Analyzer {
  static dependencies = {
    globalCooldown: GlobalCooldown,
  };

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BALANCE_OF_ALL_THINGS), this.onApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BALANCE_OF_ALL_THINGS), this.onRemoveBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  protected globalCooldown!: GlobalCooldown;

  currentBoatCycle = false // are we currently in a boat cycle?
  failedStarsurgeCount = 0 // How many starsurges have been cast in the current BOAT-window
  failedBoatWindowOpenings = 0 // number of boat windows which did not start with three consecutive starsurges
  isConvokeBoat = false // was Convoke the Spirits used this Boat Window?
  spellCount = 0 // amount of casts that have already been done in the current BOAT-window -> used to determine wether we are in the first three casts
  lastCast?: CastEvent

  onApplyBuff(event: ApplyBuffEvent) {
    this.currentBoatCycle = true
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (this.failedStarsurgeCount > 0 && !this.isConvokeBoat) { // if Convoke the Spirits was used during this BOAT Window, we do not care, a seperate module should evaluate if Convoke was used properly
      this.failedBoatWindowOpenings++
    }

    this.currentBoatCycle = false;
    this.failedStarsurgeCount = 0
    this.spellCount = 0
    this.isConvokeBoat = false;
  }

  onCast(event: CastEvent) {
    this.lastCast = event;
    if (!this.lastCast
      || !this.currentBoatCycle // if BOAT is not active, we do not need to evaluate anything;
      || this.isConvokeBoat // if Convoke the Spirits was used during this BOAT Window, we do not care, a seperate module should evaluate if Convoke was used properly
      || (this.globalCooldown.getGlobalCooldownDuration(event.ability.guid) === 0)) {  // if the spell does not have a GCD we do not care as it does not affect BOAT performance
      return;
    }

    if (this.lastCast.ability.guid === SPELLS.CONVOKE_SPIRITS.id) {
      this.isConvokeBoat = true;
      return;
    }

    // Section for Checking first 3 Casts
    if ((event.ability.guid !== SPELLS.STARSURGE_MOONKIN.id) && this.spellCount <= 2) { // if we are in the first three casts of this window and no starsurge was cast
      this.lastCast.meta = this.lastCast.meta || {}
      this.lastCast.meta.isInefficientCast = true
      this.lastCast.meta.inefficientCastReason = `Your first three casts in a BOAT-window should be Starsurges.`
      this.failedStarsurgeCount++
    }

    this.spellCount++;
  }

  get suggestionThresholds() {
    return {
      actual: this.failedBoatWindowOpenings,
      isGreaterThan: {
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>  You did not cast three consecutive <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> after getting the <SpellLink id={SPELLS.BALANCE_OF_ALL_THINGS.id} /> buff for {actual} times. Always make sure to pool atleast 90 Astral Power before entering an eclipse.</>)
      .icon(SPELLS.BALANCE_OF_ALL_THINGS.icon)
      .actual(t({
        id: "druid.balance.suggestions.boat.efficiency",
        message: `${this.suggestionThresholds.actual} of your Balance of All Things openers were wrong`
      }))

      .recommended(`${recommended} is recommended`));
  }
}

export default BalanceOfAllThingsOpener;
