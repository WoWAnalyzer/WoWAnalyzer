import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, AbsorbedEvent, RemoveBuffEvent, ApplyBuffEvent, ApplyBuffStackEvent } from 'parser/core/Events';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

const PURIFIED_CHI_PCT = 0.2;

type Absorb = {
  cast: CastEvent,
  amount: number,
  wasted: number,
  stacks: number,
};

class CelestialBrew extends Analyzer {
  _absorbs: Absorb[] = [];
  _currentAbsorb?: Absorb;
  _currentChiStacks: number = 0;

  constructor(options: any) {
    super(options);

    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_BREW), this._cbAbsorb);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_BREW), this._resetAbsorb);
    this.addEventListener(Events.removebuff.spell(SPELLS.CELESTIAL_BREW), this._expireAbsorb);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.PURIFIED_CHI), this._purifiedChiApplied);
    this.addEventListener(Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.PURIFIED_CHI), this._purifiedChiStackApplied);
    this.addEventListener(Events.fightend, this._finalize);
  }

  private _purifiedChiApplied(event: ApplyBuffEvent) {
    this._currentChiStacks = 1;
  }

  private _purifiedChiStackApplied(event: ApplyBuffStackEvent) {
    this._currentChiStacks = event.stack;
  }

  private _resetAbsorb(cast: CastEvent) {
    if(this._currentAbsorb) {
      this._absorbs.push(this._currentAbsorb);
    }

    this._currentAbsorb = {
      cast,
      amount: 0,
      wasted: 0,
      stacks: this._currentChiStacks,
    };

    this._currentChiStacks = 0;
  }

  private _cbAbsorb(event: AbsorbedEvent) {
    if(this._currentAbsorb === undefined) {
      console.error("CB absorb detected without CB active!", event);
      return;
    }

    this._currentAbsorb.amount += event.amount;
  }

  private _expireAbsorb(event: RemoveBuffEvent) {
    if(this._currentAbsorb === undefined) {
      console.error("CB expired but was never applied!", event);
      return;
    }

    this._currentAbsorb.amount = event.absorb || 0;
  }

  private _finalize() {
    if(this._currentAbsorb) {
      this._absorbs.push(this._currentAbsorb);
    }
  }

  statistic() {
    const avgAbsorb = this._absorbs.reduce((total, absorb) => total + absorb.amount, 0) / this._absorbs.length;
    const wastedAbsorb = this._absorbs.reduce((total, absorb) => total + absorb.wasted, 0);
    const avgStacks = this._absorbs.reduce((total, absorb) => total + absorb.stacks, 0) / this._absorbs.length;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CELESTIAL_BREW.id} />}
        value={formatNumber(avgAbsorb)}
        label="Avg. Absorb per Celestial Brew"
        tooltip={(
          <>
            Does not include <strong>{formatNumber(wastedAbsorb)} wasted absorb</strong> (avg: <strong>{formatNumber(wastedAbsorb / this._absorbs.length)}</strong>).<br />

            You cast Celestial Brew with an average of <strong>{avgStacks.toFixed(2)} stacks</strong> of Purified Chi, increasing the absorb amount by <strong>{formatPercentage(avgStacks * PURIFIED_CHI_PCT)}%</strong>.
          </>
        )}
      />
    );
  }
}

export default CelestialBrew;
