import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import KegSmash from '../Spells/KegSmash';
import TigerPalm from '../Spells/TigerPalm';
import AnvilHardenedWristwraps from '../Items/AnvilHardenedWristwraps';

const TIGER_PALM_REDUCTION = 1000;
const FACE_PALM_REDUCTION = 1000;
const KEG_SMASH_REDUCTION = 4000;
const BOC_KEG_SMASH_REDUCTION = 6000;
const WRISTS_REDUCTION = 1000;

class BrewCDR extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    ks: KegSmash,
    tp: TigerPalm,
    wrists: AnvilHardenedWristwraps,
  }

  get ksCDR() {
    return KEG_SMASH_REDUCTION * (this.ks.totalHits - this.ks.bocHits) + BOC_KEG_SMASH_REDUCTION * this.ks.bocHits;
  }

  get tpCDR() {
    return TIGER_PALM_REDUCTION * this.tp.totalCasts + FACE_PALM_REDUCTION * (this.tp.fpHits + this.tp.bocFpHits);
  }

  get wristCDR() {
    return WRISTS_REDUCTION * this.wrists.dodgedHits;
  }

  get totalCDR() {
    let totalCDR = 0;
    // add in KS CDR...
    totalCDR += this.ksCDR;
    // ...and TP...
    totalCDR += this.tpCDR;
    // ...and wrists
    totalCDR += this.wristCDR;
    return totalCDR;
  }

  get cooldownReductionRatio() {
    return 1.0 - this.owner.fightDuration / (this.owner.fightDuration + this.totalCDR);
  }

  get suggestionThreshold() {
    return {
      actual: this.cooldownReductionRatio,
      isLessThan: {
        minor: 0.5,
        average: 0.45,
        major: 0.4,
      },
      style: 'percentage',
    };
  }

  statistic() {
    let wristsDesc = "";
    if(this.wristsEquipped) {
      wristsDesc = `<li>Anvil-Hardened Wristwraps and ${this.wrists.dodgedHits} dodged hits — <b>${this.wristCDR / 1000}s</b></li>`;
    }
    return (
      <StatisticBox icon={<SpellIcon id={SPELLS.TIGER_PALM.id} />}
        value={`${formatPercentage(this.cooldownReductionRatio)}%`}
        label="Effective Brew CDR"
        tooltip={`Your cooldowns were reduced by: <ul>
              <li>${this.ks.totalHits} Keg Smash hits (${(this.ks.totalHits / this.ks.totalCasts).toFixed(2)} per cast) — <b>${this.ksCDR / 1000}s</b></li>
              <li>${this.tp.totalCasts} Tiger Palm hits (with ${this.tp.facePalmHits} Face Palm procs) — <b>${this.tpCDR / 1000}s</b></li>
              ${wristsDesc}
            </ul>
            <b>Total cooldown reduction:</b> ${this.totalCDR / 1000}s.</b>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default BrewCDR;
