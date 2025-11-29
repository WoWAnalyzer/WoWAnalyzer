import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginChannelEvent, DamageEvent, EndChannelEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import { CHI_SPENDERS } from '../../constants';
import { TALENTS_MONK } from 'common/TALENTS';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { formatNumber } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import DonutChart from 'parser/ui/DonutChart';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

const MAX_STACKS = 20;

class LastEmperorsCapacitor extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  totalStacks = 0;
  currentStacks = 0;
  stacksUsed = 0;
  stacksWasted = 0;
  damage = 0;
  buffedCast = false;

  totalCasts = 0;
  totalTicks = 0;
  inChannel = false;
  inChannelTarget: number | undefined = undefined;
  inChannelTargetInst: number | undefined = undefined;
  inChannelSource: number | undefined = undefined;
  currentChannelTicks = 0;
  ticksHit = [0, 0, 0, 0, 0];
  colors = ['#666', '#1eff00', '#0070ff', '#a435ee', '#ff8000'];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LAST_EMPERORS_CAPACITOR_BUFF),
      this.applyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.LAST_EMPERORS_CAPACITOR_BUFF),
      this.applyBuffStack,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(CHI_SPENDERS), this.castChiSpender);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.castCracklingJadeLightning,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.cracklingJadeLightningDamage,
    );
    this.addEventListener(
      Events.BeginChannel.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.onChannelBegin,
    );
    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(SPELLS.CRACKLING_JADE_LIGHTNING),
      this.onChannelEnd,
    );
  }

  onChannelBegin(channel: BeginChannelEvent) {
    this.inChannel = true;
  }

  onChannelEnd(event: EndChannelEvent) {
    this.inChannel = false;
    this.ticksHit[this.currentChannelTicks - 1] += 1;
    this.currentChannelTicks = 0;
    this.inChannelTarget = undefined;
    this.inChannelTargetInst = undefined;
    this.inChannelSource = undefined;
  }

  applyBuff() {
    this.totalStacks += 1;
    this.currentStacks += 1;
  }

  applyBuffStack() {
    this.totalStacks += 1;
    this.currentStacks += 1;
  }

  castChiSpender() {
    if (this.currentStacks === MAX_STACKS) {
      this.stacksWasted += 1;
    }
  }

  castCracklingJadeLightning() {
    if (this.currentStacks > 0) {
      this.buffedCast = true;
      this.stacksUsed += this.currentStacks;
      this.currentStacks = 0;
    }

    this.totalCasts += 1;
  }

  cracklingJadeLightningDamage(event: DamageEvent) {
    if (this.inChannelTarget === undefined) {
      this.inChannelTarget = event.targetID;
      this.inChannelTargetInst = event.targetInstance;
      this.inChannelSource = event.sourceID;
    }

    if (
      event.targetID !== this.inChannelTarget ||
      event.targetInstance !== this.inChannelTargetInst ||
      event.sourceID !== this.inChannelSource
    ) {
      return; // we don't want to track any of the other hits on cleave
    }

    if (this.buffedCast) {
      this.damage += event.amount + (event.absorbed || 0);
      this.buffedCast = false;
    }
    if (this.inChannel) {
      this.currentChannelTicks += 1;
    }
    this.totalTicks += 1;
  }

  get stacksWastedPerMinute() {
    return ((this.stacksWasted / this.owner.fightDuration) * 1000) / 60;
  }

  get averageTicks() {
    return this.totalTicks / this.totalCasts;
  }

  donutChart(ticks: number[]) {
    return Object.values(ticks).map((val, idx) => {
      return { label: idx + 1, color: this.colors[idx], value: val };
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
        tooltip={<>Crackling Jade Lightning ticks 5 times over the duration of the channel.</>}
        dropdown={
          <div className="pad">
            <DonutChart items={this.donutChart(this.ticksHit)} />
          </div>
        }
      >
        <BoringSpellValueText spell={SPELLS.CRACKLING_JADE_LIGHTNING}>
          {this.averageTicks.toFixed(2)} <small>Average ticks per cast</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  guideSubsection(plot: JSX.Element): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.LAST_EMPERORS_CAPACITOR_TALENT} />
        </b>{' '}
        causes your Chi generators to increase the damage of your next{' '}
        <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} /> by up to 400% (max {MAX_STACKS}{' '}
        stacks).
        <br />
        <br />
        This should be cast idealy with max stacks, however can be cast early to adjust for damage
        ampliers or addspawns when talented into{' '}
        <SpellLink spell={TALENTS_MONK.POWER_OF_THE_THUNDER_KING_TALENT} />.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_MONK.LAST_EMPERORS_CAPACITOR_TALENT} /> stacks
          </strong>
          <div style={{ fontSize: 20 }}>
            {formatNumber(this.stacksWasted)} <small>Generated stacks wasted by being capped</small>
          </div>
          {plot}
        </RoundedPanel>
        <RoundedPanel style={{ marginTop: '1rem' }}>
          <strong>
            <SpellLink spell={SPELLS.CRACKLING_JADE_LIGHTNING} /> clip analysis
          </strong>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '1', marginRight: '4rem' }}>
              <DonutChart items={this.donutChart(this.ticksHit)} />
            </div>
            <div style={{ fontSize: 20, flex: 1 }}>
              {this.averageTicks.toFixed(2)} <small>Ticks hit on average</small>
            </div>
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default LastEmperorsCapacitor;
