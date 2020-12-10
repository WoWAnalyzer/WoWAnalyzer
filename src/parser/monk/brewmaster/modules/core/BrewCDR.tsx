import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Events, { ChangeHasteEvent, EventType } from 'parser/core/Events';
import EventFilter from 'parser/core/EventFilter';
import Analyzer, { Options } from 'parser/core/Analyzer';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringValue from 'interface/statistics/components/BoringValueText';

import Abilities from '../Abilities';
import KegSmash from '../spells/KegSmash';
import TigerPalm from '../spells/TigerPalm';
import BlackOxBrew from '../spells/BlackOxBrew';

class BrewCDR extends Analyzer {
  static dependencies = {
    ks: KegSmash,
    tp: TigerPalm,
    bob: BlackOxBrew,
    abilities: Abilities,
  };
  _totalHaste = 0;
  _newHaste = 0;
  _lastHasteChange = 0;
  protected ks!: KegSmash;
  protected tp!: TigerPalm;
  protected bob!: BlackOxBrew;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this._lastHasteChange = this.owner.fight.start_time;

    this.addEventListener(new EventFilter(EventType.ChangeHaste), this._updateHaste);
    this.addEventListener(Events.fightend, this._finalizeHaste);
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
    totalCDR += this.bob.cdr[SPELLS.PURIFYING_BREW.id];
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
    const ability = this.abilities.getAbility(SPELLS.PURIFYING_BREW.id)!;
    return ability.getCooldown(this.meanHaste);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={(
          <>
            Your cooldowns were reduced by:
            <ul>
              <li>{this.ks.totalCasts} Keg Smash casts — <strong>{(this.ks.cdr / 1000).toFixed(2)}s</strong> (<strong>{(this.ks.wastedCDR / 1000).toFixed(2)}s</strong> wasted)</li>
              {this.ks.bocHits > 0 && <li>Using Blackout Combo on {this.ks.bocHits} Keg Smash hits — <strong>{(this.ks.bocCDR / 1000).toFixed(2)}s</strong> (<strong>{(this.ks.wastedBocCDR / 1000).toFixed(2)}s</strong> wasted)</li>}
              <li>{this.tp.totalCasts} Tiger Palm hits — <strong>{(this.tp.cdr / 1000).toFixed(2)}s</strong> (<strong>{(this.tp.wastedCDR / 1000).toFixed(2)}s</strong> wasted)</li>
              {this.bob.active && <li>{this.bob.casts} Black Ox Brew casts — <strong>{(this.bob.cdr[SPELLS.PURIFYING_BREW.id] / 1000).toFixed(2)}s</strong> (<strong>{(this.bob.wastedCDR[SPELLS.PURIFYING_BREW.id] / 1000).toFixed(2)}s</strong> wasted)</li>}
            </ul>
            <strong>Total cooldown reduction:</strong> {(this.totalCDR / 1000).toFixed(2)}s.<br />
          </>
        )}
      >
        <BoringValue label={<><SpellIcon id={SPELLS.TIGER_PALM.id} /> Effective Brew CDR</>}>
          <>
            {formatPercentage(this.cooldownReductionRatio)} %
          </>
        </BoringValue>
      </Statistic>
    );
  }

  private _updateHaste(event: ChangeHasteEvent) {
    this._totalHaste += event.oldHaste! * (event.timestamp - this._lastHasteChange);
    this._lastHasteChange = event.timestamp;
    this._newHaste = event.newHaste!;
  }

  private _finalizeHaste() {
    this._totalHaste += this._newHaste * (this.owner.fight.end_time - this._lastHasteChange);
  }
}

export default BrewCDR;
