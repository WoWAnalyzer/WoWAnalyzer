import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatThousands } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Second Sunrise does not cause any special events aside from additional Light of Dawn heals. These heals occur after a static amount of time, this looks to be about 700ms. Initial LoD heals always occur within 100ms, so this is a save middle where the SS delay is more likely to vary than the initial heal delay.
 */
const SECOND_SUNRISE_MINIMAL_DELAY = 300;
const SECOND_SUNRISE_PROC_CHANCE = 0.05;

/**
 * Second Sunrise (Artifact Trait)
 * Light of Dawn has a 5% chance to cast a second time for no additional mana cost.
 */
class SecondSunrise extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  rank = 0;
  healing = 0;
  procs = 0;

  get healingFactorOfOnePoint() {
    return SECOND_SUNRISE_PROC_CHANCE / (this.rank * SECOND_SUNRISE_PROC_CHANCE);
  }

  on_initialized() {
    this.rank = this.combatants.selected.traitsBySpellId[SPELLS.SECOND_SUNRISE.id];
    this.active = this.rank > 0;
  }

  _lastCast = null;
  _pendingProcRecording = false;
  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.LIGHT_OF_DAWN_CAST.id) {
      return;
    }
    this._lastCast = event.timestamp;
    this._pendingProcRecording = true;
  }
  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.LIGHT_OF_DAWN_HEAL.id || this._lastCast === null) {
      return;
    }
    const timeSinceLastCast = event.timestamp - this._lastCast;
    if (timeSinceLastCast > SECOND_SUNRISE_MINIMAL_DELAY) {
      if (this._pendingProcRecording) {
        this.procs += 1;
        this._pendingProcRecording = false;
      }
      this.healing += (event.amount + (event.absorbed || 0));
    }
  }
  on_beacon_heal(beaconTransferEvent, healEvent) {
    if (healEvent.ability.guid !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }
    const timeSinceLastCast = healEvent.timestamp - this._lastCast;
    if (timeSinceLastCast > SECOND_SUNRISE_MINIMAL_DELAY) {
      this.healing += (beaconTransferEvent.amount + (beaconTransferEvent.absorbed || 0));
    }
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SECOND_SUNRISE.id}>
            <SpellIcon id={SPELLS.SECOND_SUNRISE.id} noLink /> Second Sunrise
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`For each Light of Dawn cast you had a ${formatPercentage(this.rank * SECOND_SUNRISE_PROC_CHANCE, 0)}% chance to proc Second Sunrise. One point giving 5% proc chance is ${formatPercentage(this.healingFactorOfOnePoint, 0)}% of this ${formatPercentage(this.rank * SECOND_SUNRISE_PROC_CHANCE, 0)}% chance, so the assumption is made that ${formatPercentage(this.healingFactorOfOnePoint, 0)}% of the total healing by Second Sunrise (which was ${formatThousands(this.healing)} healing) was due to one point. This gets us a simplified average but this may be completely off since Second Sunrise is a completely random proc with a low proc rate and there's no telling whether the 5% increased chance helped this fight or not.`}>
            ≈{formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing * this.healingFactorOfOnePoint))} %
          </dfn>
        </div>
      </div>
    );
  }
}

export default SecondSunrise;
