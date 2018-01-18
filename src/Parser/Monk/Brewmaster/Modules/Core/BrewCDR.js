import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Abilities from '../Features/Abilities';
import KegSmash from '../Spells/KegSmash';
import TigerPalm from '../Spells/TigerPalm';
import IronskinBrew from '../Spells/IronSkinBrew';
import BlackOxBrew from '../Spells/BlackOxBrew';
import AnvilHardenedWristwraps from '../Items/AnvilHardenedWristwraps';

class BrewCDR extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    ks: KegSmash,
    tp: TigerPalm,
    wrists: AnvilHardenedWristwraps,
    bob: BlackOxBrew,
    isb: IronskinBrew,
    abilities: Abilities,
  }

  _totalHaste = 0;
  _newHaste = 0;
  _lastHasteChange = 0;

  get meanHaste() {
    return this._totalHaste / this.owner.fightDuration;
  }

  get totalCDR() {
    let totalCDR = 0;
    // add in KS CDR...
    totalCDR += this.ks.cdr;
    totalCDR += this.ks.bocCDR;
    // ...and TP...
    totalCDR += this.tp.cdr + this.tp.fpCDR;
    // ...and BoB...
    totalCDR += this.bob.cdr;
    // ...and wrists
    totalCDR += this.wrists.cdr;
    return totalCDR;
  }

  get cooldownReductionRatio() {
    return this.totalCDR / (this.owner.fightDuration + this.totalCDR);
  }

  // the amount of CDR required so that you can cast ISB often enough to
  // actually hit 100% uptime
  get cdrRequiredForUptime() {
    const ability = this.abilities.getAbility(SPELLS.IRONSKIN_BREW.id);
    return 1 - this.isb.durationPerCast / (ability._cooldown(this.meanHaste) * 1000);
  }

  get suggestionThreshold() {
    const target = this.cdrRequiredForUptime;
    return {
      actual: this.cooldownReductionRatio,
      isLessThan: {
        minor: target * 1.1,
        average: target,
        major: target * 0.9,
      },
      style: 'percentage',
    };
  }

  on_changehaste(event) {
    this._totalHaste += event.oldHaste * (event.timestamp - this._lastHasteChange);
    this._lastHasteChange = event.timestamp;
    this._newHaste = event.newHaste;
  }

  on_finished() {
    this._totalHaste += this._newHaste * (this.owner.fight.end_time - this._lastHasteChange);
  }


  statistic() {
    let wristsDesc = "";
    if(this.wrists.active) {
      wristsDesc = `<li>Anvil-Hardened Wristwraps and ${this.wrists.dodgedHits} dodged hits — <b>${(this.wrists.cdr / 1000).toFixed(2)}s</b> (<b>${(this.wrists.wastedCDR / 1000).toFixed(2)}s</b> wasted)</li>`;
    }
    let bobDesc = "";
    if(this.bob.active) {
      bobDesc = `<li>${this.bob.casts} Black Ox Brew casts — <b>${(this.bob.cdr / 1000).toFixed(2)}s</b> (<b>${(this.bob.wastedCDR / 1000).toFixed(2)}s</b> wasted)</li>`;
    }
    let bocKsDesc = "";
    if(this.ks.bocHits > 0) {
      bocKsDesc = `<li>Using Blackout Combo on ${this.ks.bocHits} Keg Smash hits — <b>${(this.ks.bocCDR / 1000).toFixed(2)}s</b> (<b>${(this.ks.wastedBocCDR / 1000).toFixed(2)}s</b> wasted)</li>`;
    }
    return (
      <StatisticBox icon={<SpellIcon id={SPELLS.TIGER_PALM.id} />}
        value={`${formatPercentage(this.cooldownReductionRatio)}%`}
        label="Effective Brew CDR"
        tooltip={`Your cooldowns were reduced by: <ul>
              <li>${this.ks.totalHits} Keg Smash hits (${(this.ks.totalHits / this.ks.totalCasts).toFixed(2)} per cast) — <b>${(this.ks.cdr / 1000).toFixed(2)}s</b> (<b>${(this.ks.wastedCDR / 1000).toFixed(2)}s</b> wasted)</li>
              ${bocKsDesc}
              <li>${this.tp.totalCasts} Tiger Palm hits (with ${this.tp.facePalmHits} Face Palm procs) — <b>${((this.tp.cdr + this.tp.fpCDR) / 1000).toFixed(2)}s</b> (<b>${((this.tp.wastedCDR + this.tp.wastedFpCDR) / 1000).toFixed(2)}s</b> wasted)</li>
              ${bobDesc}
              ${wristsDesc}
            </ul>
            <b>Total cooldown reduction:</b> ${(this.totalCDR / 1000).toFixed(2)}s.</b><br/>
            <b>Minimum Cooldown Reduction for 100% ISB uptime:</b> ${formatPercentage(this.cdrRequiredForUptime)}%`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default BrewCDR;
