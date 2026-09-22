import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import {
  getZenPulseConsumingCast,
  getZenPulseHitsPerCast,
  getZenPulseOvercapCast,
} from '../../normalizers/CastLinkNormalizer';
import { addEnhancedCastReason, addInefficientCastReason } from 'parser/core/EventMetaLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import { TooltipElement } from 'interface/Tooltip';
import { formatNumber, formatPercentage } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import {
  getSelectedPrimaryHeal,
  ZEN_PULSE_INCREASE_PER_STACK,
  ZEN_PULSE_MAX_HITS_FOR_BOOST,
} from '../../constants';
import Abilities from '../features/Abilities';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import CastOverview from 'interface/guide/components/CastOverview';

const MAX_STACKS = 2;

class ZenPulse extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  protected abilities!: Abilities;
  zenPulseHits = 0;
  healing = 0;
  overhealing = 0;
  refreshedBuffs = 0;
  expiredBuffs = 0;
  currentBuffs = 0;
  consumedBuffs = 0;
  badCasts = 0;
  castIncreases: number[] = [];
  entries: PerCastData[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_HEAL),
      this.onHeal,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.VIVIFY, TALENTS_MONK.SHEILUNS_GIFT_TALENT]),
      this.onCast,
    );

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onApplyBuff,
    );

    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.ZEN_PULSE_BUFF),
      this.onRemoveBuff,
    );
  }

  get avgHitsPerConsume() {
    return this.zenPulseHits / this.castIncreases.length;
  }

  get avgIncrease() {
    return (
      this.castIncreases.reduce((sum, increase) => sum + increase, 0) / this.castIncreases.length
    );
  }

  get ppm() {
    const tftCasts =
      this.abilities.abilityTracker.getAbility(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id).casts || 0;
    return this.owner
      .getPerMinute(this.consumedBuffs + this.refreshedBuffs + this.expiredBuffs - tftCasts)
      .toFixed(2);
  }

  get avgHealingPerCast() {
    return this.healing / this.castIncreases.length;
  }

  get avgRawHealingPerCast() {
    return (this.healing + this.overhealing) / this.consumedBuffs;
  }

  private onApplyBuff(_: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.currentBuffs += 1;
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    const isExpired = this.currentBuffs === MAX_STACKS;
    if (isExpired) {
      this.refreshedBuffs += 1;
      this.entries.push({
        timestamp: this.owner.formatTimestamp(event.timestamp),
        performance: QualitativePerformance.Fail,
        stats: [],
        details: `Buff refreshed at ${MAX_STACKS} stacks`,
      });

      const overcapCast = getZenPulseOvercapCast(event);
      if (overcapCast) {
        addInefficientCastReason(
          overcapCast,
          <>
            This cast procced <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} /> while already at{' '}
            {MAX_STACKS} stacks, wasting the proc.
          </>,
        );
      }
    }
  }

  private onRemoveBuff(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const consumingCast = getZenPulseConsumingCast(event);
    if (consumingCast) {
      this.consumedBuffs += 1;
      this.currentBuffs -= 1;
      addEnhancedCastReason(
        consumingCast,
        <>
          This cast consumed <SpellLink spell={SPELLS.ZEN_PULSE_BUFF} />.
        </>,
      );
    } else {
      this.expiredBuffs += 1;
      this.currentBuffs = 0;
      this.entries.push({
        timestamp: this.owner.formatTimestamp(event.timestamp),
        performance: QualitativePerformance.Fail,
        stats: [],
        details: 'Buff expired before being consumed',
      });
    }
  }

  private onHeal(event: HealEvent) {
    this.zenPulseHits += 1;
    this.healing += event.amount + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
  }

  private getPerf(events: HealEvent[]): { overheal: number; perf: QualitativePerformance } {
    const avgOverhealing =
      events
        .map((hit) => {
          const overheal = hit.overheal || 0;
          return overheal / (overheal + hit.amount + (hit.absorbed || 0));
        })
        .reduce((prev, cur) => {
          return prev + cur;
        }) / events.length;
    if (events.length < ZEN_PULSE_MAX_HITS_FOR_BOOST) {
      return { overheal: avgOverhealing, perf: QualitativePerformance.Ok };
    }

    if (avgOverhealing > 0.75) {
      return { overheal: avgOverhealing, perf: QualitativePerformance.Ok };
    }
    return { overheal: avgOverhealing, perf: QualitativePerformance.Good };
  }

  private onCast(event: HealEvent) {
    const zenPulseHits = getZenPulseHitsPerCast(event);
    if (!zenPulseHits.length) {
      return;
    }
    const perfInfo = this.getPerf(zenPulseHits);
    const percentInc =
      Math.min(zenPulseHits.length, ZEN_PULSE_MAX_HITS_FOR_BOOST) * ZEN_PULSE_INCREASE_PER_STACK;
    this.castIncreases.push(percentInc);
    this.entries.push({
      timestamp: this.owner.formatTimestamp(event.timestamp),
      performance: perfInfo.perf,
      stats: [
        {
          value: `${zenPulseHits.length}`,
          label: 'Hits',
          performance: evaluateQualitativePerformanceByThreshold({
            actual: zenPulseHits.length,
            isGreaterThanOrEqual: {
              perfect: ZEN_PULSE_MAX_HITS_FOR_BOOST,
              good: ZEN_PULSE_MAX_HITS_FOR_BOOST - 1,
              ok: ZEN_PULSE_MAX_HITS_FOR_BOOST - 2,
            },
          }),
        },
        {
          value: `${formatPercentage(perfInfo.overheal)}%`,
          label: 'Avg Overheal',
        },
        {
          value: `${formatPercentage(percentInc)}%`,
          label: 'Healing Increase',
        },
      ],
    });
    if (zenPulseHits.length < ZEN_PULSE_MAX_HITS_FOR_BOOST) {
      this.badCasts += 1;
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} />
          </b>{' '}
          is a buff that procs off of <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> that makes
          your next <SpellLink spell={getSelectedPrimaryHeal(this.selectedCombatant)} /> cast do
          additional healing on your target and all targets with{' '}
          <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />. The healing done by{' '}
          <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} /> is increased by 6% per target with{' '}
          <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> up to 30%, so it is important to have at
          least 5 ReMs active before consuming the buff.
        </p>
        <p style={{ paddingTop: '1em' }}>
          It is very important to make sure that you never let this buff expire. Ideally try to
          consume this buff to minimize overheal while ensuring that you have a high number of{' '}
          <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> buffs active.
        </p>
      </>
    );
    const stats = [
      {
        value: this.avgHitsPerConsume.toFixed(2),
        label: 'Avg Hits Per Buff',
        tooltip: <>Average number of targets hit per buff consumption</>,
        performance: evaluateQualitativePerformanceByThreshold({
          actual: this.avgHitsPerConsume,
          isGreaterThanOrEqual: {
            perfect: ZEN_PULSE_MAX_HITS_FOR_BOOST,
            good: ZEN_PULSE_MAX_HITS_FOR_BOOST - 1,
            ok: ZEN_PULSE_MAX_HITS_FOR_BOOST - 2,
          },
        }),
      },
      {
        value: `${this.expiredBuffs + this.refreshedBuffs}`,
        label: 'Wasted Buffs',
        tooltip: (
          <>
            <div>{this.expiredBuffs} expired</div>
            <div>{this.refreshedBuffs} refreshed</div>
          </>
        ),
        performance: evaluateQualitativePerformanceByThreshold({
          actual: this.expiredBuffs + this.refreshedBuffs,
          isLessThanOrEqual: { perfect: 0, good: 0, ok: 2 },
        }),
      },
    ];
    return (
      <GuideSection explanation={explanation} explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}>
        <CastOverview
          spell={TALENTS_MONK.ZEN_PULSE_TALENT}
          title={
            <>
              <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} /> Overview
            </>
          }
          stats={stats}
        />
        <CastDetail title="Buff Consumptions" casts={this.entries} />
      </GuideSection>
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>Procs per minute: {this.ppm}</li>
              <li>Effective healing: {formatNumber(this.healing)}</li>
              <li>Overhealing: {formatNumber(this.overhealing)}</li>
              <li>Average increase: {formatPercentage(this.avgIncrease)}%</li>
              <li>
                Buffs used below {ZEN_PULSE_MAX_HITS_FOR_BOOST}{' '}
                <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />
                s: {this.badCasts}
              </li>
              <li>Expired Buffs: {this.expiredBuffs}</li>
              <li>Refreshed Buffs: {this.refreshedBuffs}</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.ZEN_PULSE_TALENT}>
          <ItemHealingDone amount={this.healing} />
          <hr />
          {this.avgHitsPerConsume.toFixed(2)}{' '}
          <small>
            Average hits per <SpellLink spell={getSelectedPrimaryHeal(this.selectedCombatant)} />
          </small>
          <div></div>
          <TooltipElement
            content={
              <>
                {formatNumber(this.avgRawHealingPerCast)} <small>raw healing per cast</small>
              </>
            }
          >
            {formatNumber(this.avgHealingPerCast)} <small>healing per cast</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ZenPulse;
