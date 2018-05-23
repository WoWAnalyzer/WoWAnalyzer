import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Snapshot, { JAGGED_WOUNDS_MODIFIER } from '../FeralCore/Snapshot';

/*
Identify inefficient refreshes of the Rake DoT:
  Refresh of a Rake doing double damage due to Prowl with one that will not do double damage.
  Early refresh of a Rake doing bonus damage from snapshot buffs with one that will do less damage.
*/

const RAKE_BASE_DURATION = 15000;
class RakeSnapshot extends Snapshot {
  rakeCastCount = 0;        // count of rake casts of all kinds
  prowlLostCastCount = 0;   // count of rake buffed with Prowl ending early due to refresh without Prowl buff
  prowlLostTimeSum = 0;     // total time cut out from the end of prowl-buffed rake bleeds by refreshing early (milliseconds)
  downgradeCastCount = 0;   // count of rake DoTs refreshed with weaker snapshot before pandemic

  hasBloodtalonsTalent = false;

  on_initialized() {
    this.spellCastId = SPELLS.RAKE.id;
    this.durationOfFresh = RAKE_BASE_DURATION;
    this.isProwlAffected = true;
    this.isTigersFuryAffected = true;

    const combatant = this.combatants.selected;
    if (combatant.hasTalent(SPELLS.BLOODTALONS_TALENT.id)) {
      this.isBloodtalonsAffected = true;
      this.hasBloodtalonsTalent = true;
    }
    if (combatant.hasTalent(SPELLS.JAGGED_WOUNDS_TALENT.id)) {
      this.durationOfFresh *= JAGGED_WOUNDS_MODIFIER;
    }
  }

  on_byPlayer_cast(event) {
    if (SPELLS.RAKE.id === event.ability.guid) {
      ++this.rakeCastCount;
    }

    super.on_byPlayer_cast(event);
  }

  checkRefreshRule(event, stateOld, stateNew) {
    if (stateOld.prowl && !stateNew.prowl) {
      // refresh removed a powerful prowl-buffed bleed
      const timeLost = stateOld.expireTime - event.timestamp;
      this.prowlLostTimeSum += timeLost;
      ++this.prowlLostCastCount;

      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You lost ${(timeLost / 1000).toFixed(1)} seconds of a Rake empowered with Prowl by refreshing early.`;
    } else if (stateOld.pandemicTime > event.timestamp &&
      stateOld.power > stateNew.power &&
      !stateNew.hasProwl) {
      // refreshed with weaker DoT before pandemic window - but ignore this rule if the new Rake has Prowl buff as that's more important.
      ++this.downgradeCastCount;

      if (!event.meta || (!event.meta.isInefficientCast && !event.meta.isEnhancedCast)) {
        // this downgrade is relatively minor, so don't overwrite output from elsewhere.
        event.meta = event.meta || {};
        event.meta.isInefficientCast = true;
        event.meta.inefficientCastReason = `You refreshed with a weaker version of Rake before the pandemic window.`;
      }
    }
  }

  // seconds of double-damage Rake lost per minute
  get prowlLostTimePerMinute() {
    return (this.prowlLostTimeSum / this.owner.fightDuration) * 60;
  }
  get downgradeProportion() {
    return this.downgradeCastCount / this.rakeCastCount;
  }
  get prowlLostSuggestionThresholds() {
    return {
      actual: this.prowlLostTimePerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1.0,
        major: 3.0,
      },
      style: 'decimal',
    };
  }
  get downgradeSuggestionThresholds() {
    return {
      actual: this.downgradeProportion,
      isGreaterThan: {
        minor: 0,
        average: 0.15,
        major: 0.30,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.prowlLostSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          You sometimes replaced a powerful <SpellLink id={SPELLS.RAKE.id} /> cast with the <SpellLink id={SPELLS.PROWL.id} /> effect with one without it. You ended {this.prowlLostCastCount} empowered <SpellLink id={SPELLS.RAKE.id} /> bleed{this.prowlLostCastCount!==1?'s':''} early.
        </React.Fragment>
      )
        .icon(SPELLS.RAKE.icon)
        .actual(`${actual.toFixed(1)} seconds of Prowl buffed Rake bleed was lost per minute.`)
        .recommended(`${recommended} is recommended`);
    });

    when(this.downgradeSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          <SpellLink id={SPELLS.RAKE.id} /> DoT was replaced with a less powerful version without waiting for the pandemic window. <SpellLink id={SPELLS.RAKE.id} /> snapshots the bonus from <SpellLink id={SPELLS.PROWL.id} />, <SpellLink id={SPELLS.BLOODTALONS_TALENT.id}/>, and <SpellLink id={SPELLS.TIGERS_FURY.id} />.
        </React.Fragment>
      )
        .icon(SPELLS.RAKE.icon)
        .actual(`${formatPercentage(actual)}% of Rake casts caused early downgrading.`)
        .recommended(`${recommended}% is recommended`);
    });
  }
}
export default RakeSnapshot;
