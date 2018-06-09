import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Snapshot, { PANDEMIC_FRACTION } from '../FeralCore/Snapshot';

/**
 * Moonfire benefits from the damage bonus of Tiger's Fury over its whole duration, even if the
 * buff wears off in that time. It's a damage loss to refresh Moonfire before the pandemic window
 * if you don't have Tiger's Fury active when the existing DoT does have it active.
 */

// cat moonfire lasts for 14 seconds, unlike caster and bear moonfire with a base of 16 seconds.
const MOONFIRE_FERAL_BASE_DURATION = 14000;

class MoonfireSnapshot extends Snapshot {
  moonfireCastCount = 0;
  downgradeCastCount = 0;

  on_initialized() {
    if (!this.combatants.selected.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id)) {
      this.active = false;
      return;
    }

    this.spellCastId = SPELLS.MOONFIRE_FERAL.id;
    this.debuffId = SPELLS.MOONFIRE_FERAL.id;

    // unlike bleeds, Moonfire's duration is not affected by the Jagged Wounds talent
    this.durationOfFresh = MOONFIRE_FERAL_BASE_DURATION;
    this.isProwlAffected = false;
    this.isTigersFuryAffected = true;

    // bloodtalons only affects melee abilities
    this.isBloodtalonsAffected = false;
  }

  on_byPlayer_cast(event) {
    if (SPELLS.MOONFIRE_FERAL.id === event.ability.guid) {
      ++this.moonfireCastCount;
    }
    super.on_byPlayer_cast(event);
  }

  checkRefreshRule(stateNew) {
    const stateOld = stateNew.prev;
    if (!stateOld || stateOld.expireTime < stateNew.startTime) {
      // not a refresh, so nothing to check
      return;
    }
    
    if (stateNew.startTime >= stateOld.pandemicTime ||
        stateNew.power >= stateOld.power) {
      // good refresh
      return;
    }
    
    ++this.downgradeCastCount;
    
    // this downgrade is relatively minor, so don't overwrite cast info from elsewhere
    const event = stateNew.castEvent;
    if (event.meta && (event.meta.isInefficientCast || event.meta.isEnhancedCast)) {
      return;
    }
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = 'You refreshed with a weaker version of Moonfire before the pandemic window.';
  }

  get downgradeProportion() {
    return this.downgradeCastCount / this.moonfireCastCount;
  }
  get downgradeSuggestionThresholds() {
    return {
      actual: this.downgradeProportion,
      isGreaterThan: {
        minor: 0,
        average: 0.30,
        major: 0.60,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.downgradeSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          Try not to refresh <SpellLink id={SPELLS.MOONFIRE_FERAL.id} /> before the <dfn data-tip={`The last ${(this.durationOfFresh * PANDEMIC_FRACTION / 1000).toFixed(1)} seconds of Moonfire's duration. When you refresh during this time you don't lose any duration in the process.`}>pandemic window</dfn> unless you have more powerful <dfn data-tip={"Applying Moonfire with Tiger's Fury will boost its damage until you reapply it."}>snapshot buffs</dfn> than were present when it was first cast.
        </React.Fragment>
      )
        .icon(SPELLS.MOONFIRE_FERAL.icon)
        .actual(`${formatPercentage(actual)}% of Moonfire refreshes were early downgrades.`)
        .recommended(`${recommended}% is recommended`);
    });
  }
}
export default MoonfireSnapshot;
