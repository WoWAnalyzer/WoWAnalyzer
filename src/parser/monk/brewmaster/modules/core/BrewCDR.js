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
import StraightNoChaser from '../spells/azeritetraits/StraightNoChaser';

class BrewCDR extends Analyzer {
  static dependencies = {
    ks: KegSmash,
    tp: TigerPalm,
    bob: BlackOxBrew,
    isb: IronskinBrew,
    abilities: Abilities,
    snc: StraightNoChaser,
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
    // ...and SNC... (assuming that variance evens out and we get a full
    // charge from *most* procs)
    totalCDR += this.snc.resets * this.avgCooldown * 1000;
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

  get avgCooldown() {
    const ability = this.abilities.getAbility(SPELLS.IRONSKIN_BREW.id);
    return ability._cooldown(this.meanHaste);
  }

  // the amount of CDR required so that you can cast ISB often enough to
  // actually hit 100% uptime
  get cdrRequiredForUptime() {
    return 1 - this.isb.durationPerCast / (this.avgCooldown * 1000);
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

  on_fightend() {
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
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TIGER_PALM.id} />}
        value={`${formatPercentage(this.cooldownReductionRatio)}%`}
        label="Effective Brew CDR"
        tooltip={(
          <>
            Your cooldowns were reduced by:
            <ul>
              <li>{this.ks.totalCasts} Keg Smash casts — <strong>{(this.ks.cdr / 1000).toFixed(2)}s</strong> (<strong>{(this.ks.wastedCDR / 1000).toFixed(2)}s</strong> wasted)</li>
              {this.ks.bocHits > 0 && <li>Using Blackout Combo on {this.ks.bocHits} Keg Smash hits — <strong>{(this.ks.bocCDR / 1000).toFixed(2)}s</strong> (<strong>{(this.ks.wastedBocCDR / 1000).toFixed(2)}s</strong> wasted)</li>}
              <li>{this.tp.totalCasts} Tiger Palm hits — <strong>{(this.tp.cdr / 1000).toFixed(2)}s</strong> (<strong>{(this.tp.wastedCDR / 1000).toFixed(2)}s</strong> wasted)</li>
              {this.bob.active && <li>{this.bob.casts} Black Ox Brew casts — <strong>{(this.bob.cdr / 1000).toFixed(2)}s</strong> (<strong>{(this.bob.wastedCDR / 1000).toFixed(2)}s</strong> wasted)</li>}
              {this.snc.resets > 0 && <li>Straight, No Chaser procs — <b>≥{(this.snc.resets * this.avgCooldown).toFixed(2)}s</b> (an unknown amount wasted)</li>}
            </ul>
            <strong>Total cooldown reduction:</strong> {(this.totalCDR / 1000).toFixed(2)}s.<br />
            <strong>Minimum Cooldown Reduction for 100% ISB uptime:</strong> {formatPercentage(this.cdrRequiredForUptime)}%
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default BrewCDR;
