import React from 'react';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage } from 'common/format';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import Snapshot, { JAGGED_WOUNDS_MODIFIER, PANDEMIC_FRACTION } from '../FeralCore/Snapshot';
import ComboPointTracker from '../ComboPoints/ComboPointTracker';

const debug = false;

/**
 * Rip's base damage per second varies depending on how many combo points it was cast with.
 * Rip should always be cast with 5 combo points to get the most damage from it, but this analyzer takes into account
 * the power difference of using fewer combo points so it can give accurate results from imperfect play.
 *
 * Rip's damage snapshots the effects of Tiger's Fury and Bloodtalons. It's not affected by prowl.
 * Refreshing Rip with a less powerful version before the pandemic window is a damage loss.
 *
 * Ferocious Bite will extend a Rip bleed if the target is <25% health, or at any health with the Sabertooth talent.
 * Bite extending Rip will maintain the existing snapshot from when Rip was cast.
 * Applying a fresh Rip when you could have extended by using Bite is a damage loss, unless the Rip improved the snapshot.
 * Bite extending a weak Rip when you could have applied a stronger Rip can sometimes be a damage loss. There's a lot of
 * factors in play so this analyzer doesn't attempt to detect Bites that should have been Rips.
 *
 * When Bite extends the duration of a Rip, it doesn't trigger the refreshdebuff event in the combat log.
 *
 * This analyzer represents the effect of combo points with a "power" multiplier just as Tiger's Fury and Bloodtalons are.
 * 5 combo point rip cast with no snapshot buffs has 1.00 power.
 * 4 combo with no buffs is 0.80 power, decreasing linearly to 1 combo point giving a 0.20 power rip.
 *
 * It is possible for a buffed 4 combo rip to be more powerful than a non-buffed 5 combo rip. Using 7.3.5 numbers:
 * 4 combo with TF and BT: 0.80 * 1.15 * 1.20 = 1.104
 * Casting the 4 combo point rip was a mistake. But early-refreshing it with a non-buffed 5 combo point rip is also an error.
 */

const RIP_BASE_DURATION = 24000;
const RIP_POWER_PER_COMBO = 0.20;
const BITE_EXECUTE_RANGE = 0.25;

class RipSnapshot extends Snapshot {
  static dependencies = {
    combatants: Combatants,
    comboPointTracker: ComboPointTracker,
  };

  static spellCastId = SPELLS.RIP.id;
  static debuffId = SPELLS.RIP.id;
  static durationOfFresh = RIP_BASE_DURATION;
  static isProwlAffected = false;
  static isTigersFuryAffected = true;
  static isBloodtalonsAffected = true;

  static hasSabertooth = false;

  downgradeCount = 0;
  shouldBeBiteCount = 0;

  /**
   * Order of processed events when player casts rip is always:
   *   on_byPlayer_cast
   *   on_byPlayer_spendresource
   *   on_byPlayer_debuffapply, or on_byPlayer_debuffrefresh
   * So it's safe to store the comboLastRip on spendresource then use it in calcPower,
   * which is called by Snapshot in response to debuffapply and debuffrefresh.
   */
  comboLastRip = 0;
  healthFraction = {};

  on_initialized() {
    super.on_initialized();
    const combatant = this.combatants.selected;
    if (combatant.hasTalent(SPELLS.JAGGED_WOUNDS_TALENT.id)) {
      this.constructor.durationOfFresh = RIP_BASE_DURATION * JAGGED_WOUNDS_MODIFIER;
    }
    if (combatant.hasTalent(SPELLS.SABERTOOTH_TALENT.id)) {
      this.constructor.hasSabertooth = true;
    }
  }

  on_byPlayer_cast(event) {
    super.on_byPlayer_cast(event);
    if (SPELLS.FEROCIOUS_BITE.id === event.ability.guid) {
      debug && console.log(`${this.owner.formatTimestamp(event.timestamp)} bite cast.`);
      this.handleBiteExtend(event);
    }
  }

  on_byPlayer_spendresource(event) {
    if (SPELLS.RIP.id === event.ability.guid &&
        event.resourceChangeType === RESOURCE_TYPES.COMBO_POINTS.id) {
      this.comboLastRip = event.resourceChange;
    }
  }

  // use damage events to keep track of each target's health to tell when they're in "execute" range
  on_byPlayer_damage(event) {
    // no need to track health if combatant has sabertooth, and don't track health of friendlies.
    if (this.constructor.hasSabertooth || event.targetIsFriendly) {
      return;
    }
    this.healthFraction[encodeTargetString(event.targetID, event.targetInstance)] = event.hitPoints / event.maxHitPoints;
  }

  biteCanRefresh(target) {
    return this.constructor.hasSabertooth || 
      (this.healthFraction[target] && this.healthFraction[target] < BITE_EXECUTE_RANGE);
  }

  handleBiteExtend(event) {
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (!this.biteCanRefresh(target)) {
      return;
    }
    const existing = this.stateByTarget[target];
    if (!existing || existing.expireTime < event.timestamp) {
      return;
    }

    // Bite sets an existing Rip bleed to the base duration regardless of the current duration - even if that reduces it
    existing.expireTime = event.timestamp + this.constructor.durationOfFresh;
    existing.pandemicTime = event.timestamp + this.constructor.durationOfFresh * (1.0 - PANDEMIC_FRACTION);
    debug && console.log(`${this.owner.formatTimestamp(event.timestamp)} bite extended rip to ${this.owner.formatTimestamp(existing.expireTime)}`);
  }

  checkRefreshRule(stateNew) {
    const stateOld = stateNew.prev;
    if (!stateOld || stateOld.expireTime < stateNew.startTime) {
      return;
    }
    const event = stateNew.castEvent;
    if (!event) {
      debug && console.warn('RipSnapshot checking refresh rule with a state that was never assigned a cast event.');
      return;
    }

    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (this.biteCanRefresh(target) &&
        stateOld.power >= stateNew.power) {
      this.shouldBeBiteCount += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      const strengthComment = (stateOld.power > stateNew.power) ? 'a stronger' : 'the same strength';
      event.meta.inefficientCastReason = `Used Rip when you could have extended using Ferocious Bite and kept ${strengthComment} snapshot.`;
    }
    
    if (stateOld.pandemicTime <= stateNew.startTime ||
        stateOld.power <= stateNew.power) {
      return;
    }
    this.downgradeCount += 1;

    // this downgrade is relatively minor, so don't overwrite cast info from elsewhere
    if (event.meta && (event.meta.isInefficientCast || event.meta.isEnhancedCast)) {
      return;
    }
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = 'You refreshed with a weaker version of Rip before the pandemic window.';
  }

  calcPower(stateNew) {
    let power = super.calcPower(stateNew);
    power *= (this.comboLastRip * RIP_POWER_PER_COMBO);
    debug && console.log(`${this.owner.formatTimestamp(stateNew.startTime)} Rip applied with ${this.comboLastRip} combo points, at ${power} power.`);
    return power;
  }

  get shouldBeBiteProportion() {
    return this.shouldBeBiteCount / this.castCount;
  }
  get shouldBeBiteSuggestionThresholds() {
    return {
      actual: this.shouldBeBiteProportion,
      isGreaterThan: {
        minor: 0,
        average: 0.10,
        major: 0.20,
      },
      style: 'percentage',
    };
  }

  get downgradeProportion() {
    return this.downgradeCount / this.castCount;
  }
  get downgradeSuggestionThresholds() {
    return {
      actual: this.downgradeProportion,
      isGreaterThan: {
        minor: 0,
        average: 0.15,
        major: 0.60,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.downgradeSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          Try not to refresh <SpellLink id={SPELLS.RIP.id} /> before the <dfn data-tip={`The last ${(this.constructor.durationOfFresh * PANDEMIC_FRACTION / 1000).toFixed(1)} seconds of Rip's duration. When you refresh during this time you don't lose any duration in the process.`}>pandemic window</dfn> unless you have more powerful <dfn data-tip={"Applying Rip with Tiger's Fury or Bloodtalons will boost its damage until you reapply it."}>snapshot buffs</dfn> than were present when it was first cast.
        </React.Fragment>
      )
        .icon(SPELLS.RIP.icon)
        .actual(`${formatPercentage(actual)}% of Rip refreshes were early downgrades.`)
        .recommended(`${recommended}% is recommended`);
    });

    when(this.shouldBeBiteSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      let suggestText;
      if (this.constructor.hasSabertooth) {
        suggestText = (
          <React.Fragment>
            With <SpellLink id={SPELLS.SABERTOOTH_TALENT.id} /> you should use <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> to extend the duration of <SpellLink id={SPELLS.RIP.id} />. Only use <SpellLink id={SPELLS.RIP.id} /> when the bleed is missing or when you can improve the <dfn data-tip={"Applying Rip with Tiger's Fury or Bloodtalons will boost its damage until you reapply it. This boost is maintained when Bite extends the bleed."}>snapshot.</dfn>
          </React.Fragment>
        );
      } else {
        suggestText = (
          <React.Fragment>
            When the enemy is below {Math.round(BITE_EXECUTE_RANGE * 100)}% health you should use <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> to extend the duration of <SpellLink id={SPELLS.RIP.id} />. Only use <SpellLink id={SPELLS.RIP.id} /> when the bleed is missing or when you can improve the <dfn data-tip={"Applying Rip with Tiger's Fury or Bloodtalons will boost its damage until you reapply it. This boost is maintained when Bite extends the bleed."}>snapshot.</dfn>
          </React.Fragment>
        );
      }

      return suggest(suggestText)
        .icon(SPELLS.RIP.icon)
        .actual(`${formatPercentage(actual)}% of Rip uses could have been replaced with Bite.`)
        .recommended(`${recommended}% is recommended`);
    });
  }
}
export default RipSnapshot;
