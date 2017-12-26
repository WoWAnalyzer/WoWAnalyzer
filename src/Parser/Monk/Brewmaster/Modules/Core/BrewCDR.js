import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
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

  get totalCDR() {
    let totalCDR = 0;
    // add in KS CDR...
    totalCDR += KEG_SMASH_REDUCTION * (this.ks.totalHits - this.ks.bocHits) + BOC_KEG_SMASH_REDUCTION * this.ks.bocHits;
    // ...and TP...
    totalCDR += TIGER_PALM_REDUCTION * this.tp.totalCasts + FACE_PALM_REDUCTION * (this.tp.fpHits + this.tp.bocFpHits);
    // ...and wrists
    totalCDR += WRISTS_REDUCTION * this.wrists.dodgedHits;
    return totalCDR;
  }

  statistic() {
    let wristsDesc = "";
    if(this.wristsEquipped) {
      wristsDesc = `and ${this.dodgedHits} dodged attacks `;
    }
    return (
      <StatisticBox icon={<SpellIcon id={SPELLS.TIGER_PALM.id} />}
        value={`${this.totalCDR / 1000}s`}
        label="Total brew cooldown reduction"
        tooltip={`${this.ks.totalHits} Keg Smash hits (${this.ks.totalHits / this.ks.totalCasts} per cast) and ${this.tp.totalCasts} Tiger Palm hits (with ${this.tp.bocFpHits + this.tp.fpHits} Face Palm procs) ${wristsDesc}reduced your brew cooldowns by ${this.totalCDR / 1000}s.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default BrewCDR;
