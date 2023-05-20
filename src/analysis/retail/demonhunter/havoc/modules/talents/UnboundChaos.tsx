import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { getUnboundChaosConsumption } from 'analysis/retail/demonhunter/havoc/normalizers/UnboundChaosNormalizer';
import { Uptime } from 'parser/ui/UptimeBar';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import { UNBOUND_CHAOS_SCALING } from 'analysis/retail/demonhunter/havoc/constants';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import HideGoodCastsSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import { logSpellUseEvent } from 'parser/core/SpellUsage/SpellUsageSubSection';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';

type UnboundChaosUptime = Uptime & {
  event: ApplyBuffEvent | RefreshBuffEvent | RemoveBuffEvent;
  consumed: boolean;
};

export default class UnboundChaos extends Analyzer {
  private uses: SpellUse[] = [];
  private uptime: UnboundChaosUptime[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNBOUND_CHAOS_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.UNBOUND_CHAOS_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.UNBOUND_CHAOS_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.UNBOUND_CHAOS_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.fightend, this.finalize);
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <section>
        <strong>
          <SpellLink spell={TALENTS.UNBOUND_CHAOS_TALENT} />
        </strong>{' '}
        provides a{' '}
        {formatPercentage(
          UNBOUND_CHAOS_SCALING[this.selectedCombatant.getTalentRank(TALENTS.UNBOUND_CHAOS_TALENT)],
          0,
        )}
        % damage increase to your next <SpellLink spell={SPELLS.FEL_RUSH_CAST} /> after casting{' '}
        <SpellLink spell={SPELLS.IMMOLATION_AURA} />. You should ensure that every buff gets
        consumed.
      </section>
    );

    const goodCasts = this.uses.filter(
      (it) => it.performance === QualitativePerformance.Good,
    ).length;
    const totalCasts = this.uses.length;

    return (
      <HideGoodCastsSpellUsageSubSection
        title="Unbound Chaos"
        explanation={explanation}
        uses={this.uses}
        castBreakdownSmallText={<> - Green is a good cast, Red is a bad cast.</>}
        onPerformanceBoxClick={logSpellUseEvent}
        abovePerformanceDetails={
          <div style={{ marginBottom: 10 }}>
            <CastPerformanceSummary
              spell={TALENTS.UNBOUND_CHAOS_TALENT}
              casts={goodCasts}
              performance={QualitativePerformance.Good}
              totalCasts={totalCasts}
            />
          </div>
        }
      />
    );
  }

  statistic(): ReactNode {
    const wastedProcs = this.uptime.reduce((acc, item) => acc + (item.consumed ? 0 : 1), 0);

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.UNBOUND_CHAOS_TALENT}>
          {wastedProcs} wasted procs
        </TalentSpellText>
      </Statistic>
    );
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    const uptime: UnboundChaosUptime = {
      start: event.timestamp,
      end: event.timestamp,
      event: event,
      consumed: false,
    };

    this.uptime.push(uptime);
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    let oldUptime = this.uptime.at(-1);
    if (!oldUptime) {
      oldUptime = {
        start: this.owner.fight.start_time,
        end: event.timestamp,
        event: event,
        consumed: false,
      };

      this.uptime.push(oldUptime);
    } else {
      oldUptime.end = event.timestamp;
      oldUptime.consumed = false;
    }

    const newUptime: UnboundChaosUptime = {
      start: event.timestamp,
      end: event.timestamp,
      event: event,
      consumed: false,
    };

    this.uptime.push(newUptime);
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const cast = getUnboundChaosConsumption(event);
    let oldUptime = this.uptime.at(-1);
    if (!oldUptime) {
      oldUptime = {
        start: this.owner.fight.start_time,
        end: event.timestamp,
        event: event,
        consumed: Boolean(cast),
      };

      this.uptime.push(oldUptime);
    } else {
      oldUptime.end = event.timestamp;
      oldUptime.consumed = Boolean(cast);
    }
  }

  private finalize() {
    // finalize uptime
    const uptime = this.uptime.at(-1);
    if (uptime && uptime.end === uptime.start) {
      uptime.end = this.owner.fight.end_time;
    }

    // finalize performances
    this.uses = this.uptime.map(this.unboundChaosUptimeToSpellUse);
  }

  private unboundChaosUptimeToSpellUse(unboundChaosUptime: UnboundChaosUptime): SpellUse {
    const consumed = unboundChaosUptime.consumed;
    const performance = consumed ? QualitativePerformance.Good : QualitativePerformance.Fail;
    const summary = (
      <div>
        Consumed with <SpellLink spell={SPELLS.FEL_RUSH_CAST} />
      </div>
    );
    const details = consumed ? (
      <div>
        You consumed your <SpellLink spell={TALENTS.UNBOUND_CHAOS_TALENT} /> buff by casting{' '}
        <SpellLink spell={SPELLS.FEL_RUSH_CAST} />. Good job!
      </div>
    ) : (
      <div>
        You did not consume your <SpellLink spell={TALENTS.UNBOUND_CHAOS_TALENT} /> buff. Ensure
        that every time you get <SpellLink spell={TALENTS.UNBOUND_CHAOS_TALENT} /> buff, you consume
        it by casting <SpellLink spell={SPELLS.FEL_RUSH_CAST} />.
      </div>
    );

    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'consumption',
        timestamp: unboundChaosUptime.start,
        performance,
        summary,
        details,
      },
    ];
    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );

    return {
      event: unboundChaosUptime.event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }
}
