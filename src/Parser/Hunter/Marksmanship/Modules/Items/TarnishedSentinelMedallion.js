import React from 'react';
import ImportTarnishedSentinelMedallion from 'Parser/Core/Modules/Items/TarnishedSentinelMedallion';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

class TarnishedSentinelMedallion extends ImportTarnishedSentinelMedallion {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
    combatants: Combatants,
  };

  TS_LENGTH = 15000;
  PAIRING_LEEWAY = 5000; //giving 5 (as agreed upon with Putro) seconds of leeway (so that half of Medallion has TS)
  medallionEnd = 0;
  medallionUptime = [];
  medallionDuration = 20000;
  medallionCasts = 0;

  damageAbilities = new Set([SPELLS.SPECTRAL_BOLT.id, SPELLS.SPECTRAL_BLAST.id]);

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (this.damageAbilities.has(spellId) && event.timestamp > this.medallionEnd) {
      this.medallionEnd = event.timestamp + this.medallionDuration;
      this.medallionUptime.push({ 'start': event.timestamp, 'end': this.medallionEnd });
      this.checkOverlap();
    }
    if (this.damageAbilities.has(spellId)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  on_byPlayer_cast(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.SPECTRAL_OWL.id) {
      return;
    }
    this.medallionCasts += 1;
  }

  checkOverlap() {
    this.medallionCastsWithTS = 0;
    this.medallionUptime.forEach(cast => {
      this.cooldownThroughputTracker.pastCooldowns.forEach(ts => {
        let tsEnd; //because sometimes ts.end is undefined if the parser hasn't gotten there yet
        if (!ts.end) {
          tsEnd = ts.start + this.TS_LENGTH;
        }
        else {
          tsEnd = ts.end;
        }
        if (ts.start > cast.start - this.PAIRING_LEEWAY && tsEnd < cast.end + this.PAIRING_LEEWAY && ts.spell.id === SPELLS.TRUESHOT.id) {
          this.medallionCastsWithTS++;
        }
      });
    });
  }

  item() {
    return {
      item: ITEMS.TARNISHED_SENTINEL_MEDALLION,
      result: (
        <dfn data-tip={`<b> ${formatNumber(this.medallionCastsWithTS)} out of ${formatNumber(this.medallionCasts)} </b> Medallion casts were combined with Trueshot. <br/><b>OBS:</b> For a medallion cast to be considered combined with Trueshot, 10 seconds of it has to be affected by Trueshot.`}>
          {formatNumber(this.damage)} damage - {this.owner.formatItemDamageDone(this.damage)}
        </dfn>
      ),
    };
  }
}

export default TarnishedSentinelMedallion;
