import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import {
  MajorDefensive,
  Mitigation,
  MitigationSegment,
} from 'interface/guide/components/MajorDefensives/core';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringValue from 'parser/ui/BoringValueText';
import FooterChart, { formatTime } from 'parser/ui/FooterChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ReactNode } from 'react';
import CountsAsBrew from '../../components/CountsAsBrew';
import { damageEvent } from './normalizer';

const PURIFIED_CHI_PCT = 0.2;
const PURIFIED_CHI_WINDOW = 150;

/**
 * The number of stacks needed to get a 100% bonus to the shield.
 */
const PURIFIED_CHI_STACKS_PER_100 = 5;
const WASTED_THRESHOLD = 0.75;

type AbsorbExtras = {
  wastedAmount: number;
  purifiedChiStacks: number;
};

type Absorb = Mitigation & AbsorbExtras;

class CelestialBrew extends MajorDefensive {
  private _absorbs: AbsorbExtras[] = [];
  private _currentChiStacks: number = 0;
  private _expireTime: number | null = null;

  constructor(options: Options) {
    super({ triggerSpell: talents.CELESTIAL_BREW_TALENT }, options);

    this.active = this.selectedCombatant.hasTalent(talents.CELESTIAL_BREW_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.CELESTIAL_BREW_TALENT),
      this._resetAbsorb,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(talents.CELESTIAL_BREW_TALENT),
      this._expireAbsorb,
    );

    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(talents.CELESTIAL_BREW_TALENT),
      this._cbAbsorb,
    );

    if (this.selectedCombatant.hasTalent(talents.IMPROVED_CELESTIAL_BREW_TALENT)) {
      this.addEventListener(
        Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.PURIFIED_CHI),
        this._purifiedChiApplied,
      );
      this.addEventListener(
        Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.PURIFIED_CHI),
        this._purifiedChiStackApplied,
      );
      this.addEventListener(
        Events.removebuff.spell(SPELLS.PURIFIED_CHI).to(SELECTED_PLAYER),
        this._expirePurifiedChi,
      );
    }
  }

  get absorbs(): Absorb[] {
    return this.mitigations.map((mit, ix) => ({ ...mit, ...this._absorbs[ix] }));
  }

  get goodCastSuggestion() {
    const actual =
      this.absorbs.filter(
        ({ amount, wastedAmount }) => amount / (amount + wastedAmount) >= WASTED_THRESHOLD,
      ).length / this.absorbs.length;
    return {
      actual,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  expireChi(timestamp: number) {
    if (this._expireTime && timestamp - this._expireTime > PURIFIED_CHI_WINDOW) {
      this._expireTime = null;
      this._currentChiStacks = 0;
    }
  }

  description(): ReactNode {
    return (
      <div>
        <p>
          <SpellLink id={talents.CELESTIAL_BREW_TALENT} /> provides a low-cooldown shield for
          30-100% of your health bar. <CountsAsBrew baseCooldown={60} lightBrewing /> To use it
          effectively, you need to balance two goals: using it to <em>cover major damage events</em>
          , and using it <em>often</em>.
        </p>
        <p>
          If the <a href="#purifying-brew">previous section</a> shows many purifies for{' '}
          <em>Large Hits</em> or <em>High Stagger</em>, it is <strong>strongly recommended</strong>{' '}
          that you also use <SpellLink id={talents.IMPROVED_CELESTIAL_BREW_TALENT} />.
        </p>
      </div>
    );
  }

  suggestions(when: When) {
    when(this.goodCastSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should try to use <SpellLink id={talents.CELESTIAL_BREW_TALENT.id} /> when most or all
          of the absorb will be consumed.
        </>,
      )
        .icon(talents.CELESTIAL_BREW_TALENT.icon)
        .actual(
          `${formatPercentage(actual)}% of your absorbs expired with more than 25% remaining.`,
        )
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    const avgAbsorb =
      this.absorbs.length === 0
        ? 0
        : this.absorbs.reduce((total, absorb) => total + absorb.amount, 0) / this.absorbs.length;
    const wastedAbsorb = this.absorbs.reduce((total, absorb) => total + absorb.wastedAmount, 0);
    const avgStacks =
      this.absorbs.length === 0
        ? 0
        : this.absorbs.reduce((total, absorb) => total + absorb.purifiedChiStacks, 0) /
          this.absorbs.length;

    const spec = {
      mark: 'bar' as const,
      transform: [
        {
          fold: ['amount', 'wasted'],
        },
        {
          calculate: 'datum.timestamp / 60000',
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
            domain: ['amount', 'wasted'],
            range: ['rgb(112, 181, 112)', 'rgb(255, 128, 0)'],
          },
        },
        order: { field: 'key' },
        tooltip: [
          { field: 'time_label', type: 'nominal' as const, title: 'Time' },
          { field: 'stacks', type: 'ordinal' as const, title: 'Purified Chi Stacks' },
          {
            field: 'amount',
            type: 'quantitative' as const,
            title: 'Damage Absorbed',
            format: '.3~s',
          },
          {
            field: 'wasted',
            type: 'quantitative' as const,
            title: 'Absorb Wasted',
            format: '.3~s',
          },
        ],
      },
    };

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={
          <>
            Does not include <strong>{formatNumber(wastedAbsorb)} wasted absorb</strong> (avg:{' '}
            <strong>{formatNumber(wastedAbsorb / this._absorbs.length)}</strong>).
            <br />
            You cast Celestial Brew with an average of{' '}
            <strong>{avgStacks.toFixed(2)} stacks</strong> of Purified Chi, increasing the absorb
            amount by <strong>{formatPercentage(avgStacks * PURIFIED_CHI_PCT)}%</strong>.
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon id={talents.CELESTIAL_BREW_TALENT.id} /> Avg. Absorb per Celestial Brew
            </>
          }
        >
          <>
            {formatNumber(avgAbsorb)}
            <br />
            <FooterChart
              spec={spec}
              data={this.absorbs.map((ev) => ({ ...ev, cast: undefined }))}
            />
          </>
        </BoringValue>
      </Statistic>
    );
  }

  private _expirePurifiedChi(event: RemoveBuffEvent) {
    this._expireTime = event.timestamp;
  }

  private _purifiedChiApplied(event: ApplyBuffEvent) {
    this.expireChi(event.timestamp);

    this._currentChiStacks = 1;
  }

  private _purifiedChiStackApplied(event: ApplyBuffStackEvent) {
    this._currentChiStacks = event.stack;
  }

  private get currentAbsorb(): AbsorbExtras | undefined {
    return this._absorbs[this._absorbs.length - 1];
  }

  private _resetAbsorb(cast: CastEvent) {
    this.expireChi(cast.timestamp);

    this._absorbs.push({
      wastedAmount: 0,
      purifiedChiStacks: this._currentChiStacks,
    });

    this._currentChiStacks = 0;
  }

  private _cbAbsorb(event: AbsorbedEvent) {
    if (!this.isDefensiveActive(event)) {
      console.error('CB absorb detected without CB active!', event);
      return;
    }

    this.recordMitigation({
      // we try to put in the damage event, but worst case we plug in the absorb event
      event: damageEvent(event) ?? event,
      mitigatedAmount: event.amount,
    });
  }

  private _expireAbsorb(event: RemoveBuffEvent) {
    if (this.currentAbsorb) {
      this.currentAbsorb.wastedAmount = event.absorb || 0;
    }
  }

  mitigationSegments(mit: Mitigation): MitigationSegment[] {
    if (this.selectedCombatant.hasTalent(talents.IMPROVED_CELESTIAL_BREW_TALENT)) {
      const absorb = this.absorbs.find((absorb) => absorb.start === mit.start)!;
      const totalAmount = absorb.amount + absorb.wastedAmount;

      const baseRatio =
        PURIFIED_CHI_STACKS_PER_100 / (PURIFIED_CHI_STACKS_PER_100 + absorb.purifiedChiStacks);

      const baseAmount = Math.min(totalAmount * baseRatio, absorb.amount);
      const stackAmount = absorb.amount - baseAmount;

      return [
        {
          amount: baseAmount,
          color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
          tooltip: (
            <>
              Base <SpellLink id={this.spell} />
            </>
          ),
        },
        {
          amount: stackAmount,
          color: color(MAGIC_SCHOOLS.ids.HOLY),
          tooltip: <SpellLink id={talents.IMPROVED_CELESTIAL_BREW_TALENT} />,
        },
      ];
    } else {
      return super.mitigationSegments(mit);
    }
  }
}

export default CelestialBrew;
