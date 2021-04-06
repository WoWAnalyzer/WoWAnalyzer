import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import React from 'react';

class BalanceOfAllThingsOpener extends Analyzer {
  /*
    This module is used to determine wether there were three starsurge cast used to open a Balance of All Things window when in a single target situation.
    There are several special situations that need to be filtered out in order to avoid unnecessary warnings:
    1. When currently in a multitarget situation one might not want to spend his AP on starsurges, in order to keep up starfall
    2. When at the start of the fight you do not have enough AP to open up with 3 starsurges
    3. When using Convoke the Spirits you do not open with starsurges
    */
  static dependencies = {
    globalCooldown: GlobalCooldown,
  };

  constructor(options: Options) {
    super(options);

    const active = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.BALANCE_OF_ALL_THINGS_SOLAR.bonusID,
    );
    if (!active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BALANCE_OF_ALL_THINGS_SOLAR),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BALANCE_OF_ALL_THINGS_LUNAR),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BALANCE_OF_ALL_THINGS_SOLAR),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BALANCE_OF_ALL_THINGS_LUNAR),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  protected globalCooldown!: GlobalCooldown;

  currentBoatCycle = false; // are we currently in a boat cycle?
  failedStarsurgeCount = 0; // How many starsurges have been cast in the current BOAT-window
  failedBoatWindowOpenings = 0; // number of BOAT windows which did not start with three consecutive starsurges
  boatWindowCount = 0; // sum of BOAT windows in the fight, used to see if
  lastCast?: CastEvent;
  targetsHit: number[] = []; // list of unique targetIDs which were hit inside BOAT window
  castedSpells: CastEvent[] = []; // array of casted spell inside current BOAT window

  onDamage(event: DamageEvent) {
    if (!this.targetsHit.includes(event.targetID) && !event.targetIsFriendly) {
      this.targetsHit.push(event.targetID);
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.currentBoatCycle = true;
    this.boatWindowCount += 1;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    /*
     After each BOAT window we analyze the spells in retrospective, this is done to see if there were multiple targets available during the boat window,
     in which case we do not evaluate the opener performance.
     */
    if (this.targetsHit.length <= 1 && this.boatWindowCount !== 1) {
      // only analyze if it was a single target situation
      this.analyzeCasts();
    }

    if (this.failedStarsurgeCount > 0) {
      this.failedBoatWindowOpenings += 1;
    }

    // Reset Variables after current BOAT cycle has ended
    this.currentBoatCycle = false;
    this.failedStarsurgeCount = 0;
    this.targetsHit = [];
    this.castedSpells = [];
  }

  onCast(event: CastEvent) {
    this.lastCast = event;

    if (
      !this.lastCast ||
      !this.currentBoatCycle || // if BOAT is not active, we do not need to track spell casts
      this.globalCooldown.getGlobalCooldownDuration(event.ability.guid) === 0
    ) {
      //spells which don't invoke a GCD don't affect BOAT performance
      return;
    }
    this.castedSpells.push(this.lastCast);
  }

  analyzeCasts() {
    let isConvokeBoat = false;
    //iterate through all Casts and check if Convoke the Spirits was casted
    this.castedSpells.forEach((cast) => {
      if (cast.ability.guid === SPELLS.CONVOKE_SPIRITS.id) {
        isConvokeBoat = true;
      }
    });

    let currentCast: CastEvent;
    // analyze the first three casts, if Convoke was not casted
    if (!isConvokeBoat) {
      for (let i = 0; i <= 2; i += 1) {
        currentCast = this.castedSpells[i];

        if (currentCast && currentCast.ability.guid !== SPELLS.STARSURGE_MOONKIN.id) {
          currentCast.meta = currentCast.meta || {};
          currentCast.meta.isInefficientCast = true;
          currentCast.meta.inefficientCastReason = `Your first three casts after obtaining the Balance of All Things buff (which you get after entering an eclipse) should be Starsurges while fighting a single target.`;
          this.failedStarsurgeCount += 1;
        }
      }
    }
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          {' '}
          You did not cast three consecutive <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> after
          getting the <SpellLink id={SPELLS.BALANCE_OF_ALL_THINGS_SOLAR.id} /> buff for {actual}{' '}
          times. Always make sure to pool for atleast 90 Astral Power before entering an eclipse. It
          is expected to overcap some Astral Power to achieve this.
        </>,
      )
        .icon(SPELLS.BALANCE_OF_ALL_THINGS_SOLAR.icon)
        .actual(
          t({
            id: 'druid.balance.suggestions.boat.efficiency',
            message: `${this.suggestionThresholds.actual} of your Balance of All Things openers were wrong`,
          }),
        )

        .recommended(`${recommended} is recommended`),
    );
  }
}

export default BalanceOfAllThingsOpener;
