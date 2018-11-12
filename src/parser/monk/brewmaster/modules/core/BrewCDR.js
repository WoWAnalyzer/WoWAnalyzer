import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Abilities from '../Abilities';
import KegSmash from '../spells/KegSmash';
import TigerPalm from '../spells/TigerPalm';
import IronskinBrew from '../spells/IronSkinBrew';
import BlackOxBrew from '../spells/BlackOxBrew';

class BrewCDR extends Analyzer {
  static dependencies = {
    ks: KegSmash,
    tp: TigerPalm,
    bob: BlackOxBrew,
    isb: IronskinBrew,
    abilities: Abilities,
  };

  _totalHaste = 0;
  _newHaste = 0;
  _lastHasteChange = 0;

  constructor(...args) {
    super(...args);
    this._lastHasteChange = this.owner.fight.start_time;
  }

  get meanHaste() {
    return this._totalHaste / this.owner.fightDuration;
  }

  get totalCDR() {
    let totalCDR = 0;
    // add in KS CDR...
    totalCDR += this.ks.cdr;
    totalCDR += this.ks.bocCDR;
    // ...and TP...
    totalCDR += this.tp.cdr;
    // ...and BoB...
    totalCDR += this.bob.cdr;
    return totalCDR;
  }

  // The idea here is pretty simple: we have an amount of time that has
  // passed (fightDuration) and an amount of time that has "passed"
  // via flat cooldown reduction on abilities (totalCDR). For example,
  // Keg Smash effetively causes 4 seconds to "pass" when cast. So we
  // want to know what fraction of time that has passed was caused by
  // cooldown reduction effects, which is:
  //
  // cdr% = totalCDR / (fightDuration + totalCDR)
  //
  // related:
  // https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1238#discussion_r163734298
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

  suggestions(when) {
    when(this.suggestionThreshold).addSuggestion((suggest, actual, recommended) => {
      const bobText = this.bob.active ? <> and <SpellLink id={SPELLS.BLACK_OX_BREW_TALENT.id} /></> : null;
      return suggest(<>You are not generating enough <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> charges through your rotation to maintain the buff. Make sure you are using <SpellLink id={SPELLS.KEG_SMASH.id} />{bobText} as much as possible.</>)
        .icon(SPELLS.IRONSKIN_BREW.icon)
        .actual(`${formatPercentage(actual)}% CDR`)
        .recommended(`at least ${formatPercentage(recommended)}% CDR is recommended`);
    });
  }

  statistic() {
    let bobDesc = "";
    if (this.bob.active) {
      bobDesc = `<li>${this.bob.casts} Black Ox Brew casts — <b>${(this.bob.cdr / 1000).toFixed(2)}s</b> (<b>${(this.bob.wastedCDR / 1000).toFixed(2)}s</b> wasted)</li>`;
    }
    let bocKsDesc = "";
    if (this.ks.bocHits > 0) {
      bocKsDesc = `<li>Using Blackout Combo on ${this.ks.bocHits} Keg Smash hits — <b>${(this.ks.bocCDR / 1000).toFixed(2)}s</b> (<b>${(this.ks.wastedBocCDR / 1000).toFixed(2)}s</b> wasted)</li>`;
    }
    return (
      <StatisticBox icon={<SpellIcon id={SPELLS.TIGER_PALM.id} />}
        value={`${formatPercentage(this.cooldownReductionRatio)}%`}
        label="Effective Brew CDR"
        tooltip={`Your cooldowns were reduced by: <ul>
              <li>${this.ks.totalCasts} Keg Smash casts— <b>${(this.ks.cdr / 1000).toFixed(2)}s</b> (<b>${(this.ks.wastedCDR / 1000).toFixed(2)}s</b> wasted)</li>
              ${bocKsDesc}
              <li>${this.tp.totalCasts} Tiger Palm hits — <b>${(this.tp.cdr / 1000).toFixed(2)}s</b> (<b>${(this.tp.wastedCDR / 1000).toFixed(2)}s</b> wasted)</li>
              ${bobDesc}
            </ul>
            <b>Total cooldown reduction:</b> ${(this.totalCDR / 1000).toFixed(2)}s.</b><br/>
            <b>Minimum Cooldown Reduction for 100% ISB uptime:</b> ${formatPercentage(this.cdrRequiredForUptime)}%`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default BrewCDR;
