import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  CastEvent,
  DamageEvent,
  HasRelatedEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';

import { SpellLink } from 'interface';
import { formatNumber, formatPercentage } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import CastOverview from 'interface/guide/components/CastOverview';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import { DANCE_OF_CHI_JI_INCREASE } from '../../constants';
import { DANCE_OF_CHI_JI_CONSUME } from '../../normalizers/EventLinks/EventLinkConstants';
import { isDanceOfChiJi } from '../../normalizers/CastLinkNormalizer';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';
import GuideSection from 'interface/guide/components/GuideSection';

class DanceOfChiJi extends Analyzer {
  private procs = { total: 0, wasted: 0, expired: 0 };
  private buffedCast = false;
  private damage = 0;
  private healing = 0;
  private casts: CastEvaluation[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.DANCE_OF_CHI_JI_MISTWEAVER_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DANCE_OF_CHI_JI_MW_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DANCE_OF_CHI_JI_MW_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DANCE_OF_CHI_JI_MW_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK),
      this.onSCKCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SPINNING_CRANE_KICK_DAMAGE),
      this.onSCKDamage,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.WOTC_HEAL, SPELLS.WOTC_CRIT_HEAL]),
      this.onWotCHeal,
    );
  }

  private onApplyBuff() {
    this.procs.total += 1;
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    this.procs.total += 1;
    this.procs.wasted += 1;
    this.casts.push({
      timestamp: event.timestamp,
      performance: QualitativePerformance.Fail,
      reason: 'Buff refreshed before being consumed, wasting the previous proc',
    });
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    if (HasRelatedEvent(event, DANCE_OF_CHI_JI_CONSUME)) {
      this.casts.push({
        timestamp: event.timestamp,
        performance: QualitativePerformance.Good,
        reason: 'Buff consumed by Spinning Crane Kick',
      });
    } else {
      this.procs.expired += 1;
      this.casts.push({
        timestamp: event.timestamp,
        performance: QualitativePerformance.Fail,
        reason: 'Buff expired before being consumed',
      });
    }
  }

  private onSCKCast(event: CastEvent) {
    this.buffedCast = isDanceOfChiJi(event);
  }

  private onSCKDamage(event: DamageEvent) {
    if (!this.buffedCast) return;

    this.damage += calculateEffectiveDamage(event, DANCE_OF_CHI_JI_INCREASE);
  }

  private onWotCHeal(event: HealEvent) {
    if (!this.buffedCast) return;

    this.healing += calculateEffectiveHealing(event, DANCE_OF_CHI_JI_INCREASE);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink spell={TALENTS_MONK.DANCE_OF_CHI_JI_MISTWEAVER_TALENT} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <div>Effective healing: {formatNumber(this.healing)}</div>
            <div>Effective damage: {formatNumber(this.damage)}</div>
            <div>{this.procs.wasted + this.procs.expired} wasted buffs</div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_MONK.DANCE_OF_CHI_JI_MISTWEAVER_TALENT}>
          <div>
            <ItemHealingDone amount={this.healing} />
          </div>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.DANCE_OF_CHI_JI_MW_BUFF} />
          </b>{' '}
          is a buff that causes your next <SpellLink spell={SPELLS.SPINNING_CRANE_KICK} /> to deal
          an additional {DANCE_OF_CHI_JI_INCREASE * 100}% damage
          {(this.selectedCombatant.hasTalent(TALENTS_MONK.WAY_OF_THE_CRANE_TALENT) && (
            <>
              {', '}which converts to healing via{' '}
              <SpellLink spell={TALENTS_MONK.WAY_OF_THE_CRANE_TALENT} />
            </>
          )) || (
            <>
              but does not convert to healing without{' '}
              <SpellLink spell={TALENTS_MONK.WAY_OF_THE_CRANE_TALENT} />, and is purely a damage
              increase
            </>
          )}
          . Consuming your buffs soon after receiving them is important to avoid overriding them, as
          all spells and abilities can trigger the proc.
        </p>
      </>
    );

    const stats = [
      {
        value: `${this.procs.expired + this.procs.wasted}`,
        label: 'Wasted Buffs',
        tooltip: (
          <>
            <div>{this.procs.expired} expired</div>
            <div>{this.procs.wasted} refreshed</div>
          </>
        ),
        performance: evaluateQualitativePerformanceByThreshold({
          actual: this.procs.expired + this.procs.wasted,
          isLessThanOrEqual: { perfect: 0, good: 0, ok: 2 },
        }),
      },
    ];

    return (
      <GuideSection explanation={explanation}>
        <CastOverview spell={TALENTS_MONK.DANCE_OF_CHI_JI_MISTWEAVER_TALENT} stats={stats} />
        <CastSummary
          spell={TALENTS_MONK.DANCE_OF_CHI_JI_MISTWEAVER_TALENT}
          title={'Buff Utilization'}
          casts={this.casts}
          showBreakdown
          startExpanded
        />
      </GuideSection>
    );
  }
}

export default DanceOfChiJi;
