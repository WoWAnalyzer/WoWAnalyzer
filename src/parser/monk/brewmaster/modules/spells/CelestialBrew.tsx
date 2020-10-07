import React from 'react';

import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, AbsorbedEvent, RemoveBuffEvent, ApplyBuffEvent, ApplyBuffStackEvent } from 'parser/core/Events';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import FooterChart, { formatTime } from 'interface/others/FooterChart';

const PURIFIED_CHI_PCT = 0.2;
const PURIFIED_CHI_WINDOW = 150;

type Absorb = {
  cast: CastEvent,
  timestamp: number, // timestamp relative to start time
  amount: number,
  wasted: number,
  stacks: number,
};

class CelestialBrew extends Analyzer {
  _absorbs: Absorb[];
  _currentAbsorb?: Absorb;
  _currentChiStacks: number = 0;
  _expireTime: number | null = null;

  constructor(options: Options) {
    super(options);

    this._absorbs = [];

    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_BREW), this._cbAbsorb);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_BREW), this._resetAbsorb);
    this.addEventListener(Events.removebuff.spell(SPELLS.CELESTIAL_BREW), this._expireAbsorb);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.PURIFIED_CHI), this._purifiedChiApplied);
    this.addEventListener(Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.PURIFIED_CHI), this._purifiedChiStackApplied);
    this.addEventListener(Events.removebuff.spell(SPELLS.PURIFIED_CHI).to(SELECTED_PLAYER), this._expirePurifiedChi);
    this.addEventListener(Events.fightend, this._finalize);
  }

  private _expirePurifiedChi(event: RemoveBuffEvent) {
    this._expireTime = event.timestamp;
  }

  expireChi(timestamp: number) {
    if(this._expireTime && timestamp - this._expireTime > PURIFIED_CHI_WINDOW) {
      this._expireTime = null;
      this._currentChiStacks = 0;
    }
  }

  private _purifiedChiApplied(event: ApplyBuffEvent) {
    this.expireChi(event.timestamp);

    this._currentChiStacks = 1;
  }

  private _purifiedChiStackApplied(event: ApplyBuffStackEvent) {
    this._currentChiStacks = event.stack;
  }

  private _resetAbsorb(cast: CastEvent) {
    this.expireChi(cast.timestamp);

    if(this._currentAbsorb) {
      this._absorbs.push(this._currentAbsorb);
    }

    this._currentAbsorb = {
      cast,
      timestamp: cast.timestamp - this.owner.fight.start_time,
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

    this._currentAbsorb.wasted = event.absorb || 0;
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

    const spec = {
      mark: 'bar' as const,
      transform: [
        {
          fold: ['amount', 'wasted'],
        },
        {
          calculate: "datum.timestamp / 60000",
          as: 'time_min',
        },
        {
          calculate: formatTime(),
          as: 'time_label',
        },
      ],
      encoding: {
        x: {
          field: 'time_min',
          type: 'quantitative' as const,
          axis: {
            title: null,
            labelExpr: formatTime('(datum.value * 60000)'),
            grid: false,
          },
          scale: { zero: true },
        },
        y: {
          field: 'value',
          type: 'quantitative' as const,
          title: null,
          axis: {
            format: '~s',
            tickCount: 3,
            grid: false,
          },
          stack: true,
        },
        color: {
          field: 'key',
          type: 'nominal' as const,
          legend: null,
          scale: {
            domain: ["amount", "wasted"],
            range: ["rgb(112, 181, 112)", "rgb(255, 128, 0)"],
          },
        },
        order: { field: 'key' },
        tooltip: [
          { field: 'time_label', type: 'nominal' as const, title: 'Time' },
          { field: 'stacks', type: 'ordinal' as const, title: 'Purified Chi Stacks' },
          { field: 'amount', type: 'quantitative' as const, title: 'Damage Absorbed', format: '.3~s' },
          { field: 'wasted', type: 'quantitative' as const, title: 'Absorb Wasted', format: '.3~s' },
        ],
      },
    };

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
        footer={(<FooterChart spec={spec} data={this._absorbs} />)}
      />
    );
  }
}

export default CelestialBrew;
