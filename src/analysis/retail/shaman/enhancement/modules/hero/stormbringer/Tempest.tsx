import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  CastEvent,
  EventType,
  FreeCastEvent,
  GetRelatedEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import SpellLink from 'interface/SpellLink';
import RESOURCE_TYPES, { getResourceCost } from 'game/RESOURCE_TYPES';
import {
  evaluateQualitativePerformanceByThreshold,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import GuideSection from 'interface/guide/components/GuideSection';
import CastOverview, { type StatisticData } from 'interface/guide/components/CastOverview';
import { EnhancementEventLinks } from '../../../constants';

const FULL_MSW_STACKS = 10;

const CONSUME_REFRESH_WINDOW_MS = 100;

class Tempest extends Analyzer {
  private consumedAtFullStacks = 0;
  private consumedAtLowStacks = 0;
  private wastedExpires = 0;
  private wastedRefreshes = 0;

  private lastStackLossTimestamp = -Infinity;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TEMPEST_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_CAST), this.onCast);
    this.addEventListener(
      Events.freecast.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_CAST),
      this.onCast,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TEMPEST_BUFF),
      this.onRefreshBuff,
    );
  }

  private onCast(event: CastEvent | FreeCastEvent) {
    const stacks = getResourceCost(event.resourceCost, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
    if (stacks === undefined || stacks >= FULL_MSW_STACKS) {
      this.consumedAtFullStacks += 1;
    } else {
      this.consumedAtLowStacks += 1;
    }
  }

  private onRemoveBuff(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    this.lastStackLossTimestamp = event.timestamp;

    const consumingCast = GetRelatedEvent<AnyEvent>(
      event,
      EnhancementEventLinks.TEMPEST_CONSUME_LINK,
      (related) => related.type === EventType.Cast || related.type === EventType.FreeCast,
    );

    if (!consumingCast) {
      this.wastedExpires += 1;
    }
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    if (event.timestamp - this.lastStackLossTimestamp <= CONSUME_REFRESH_WINDOW_MS) {
      return;
    }
    this.wastedRefreshes += 1;
  }

  private get totalProcs() {
    return (
      this.consumedAtFullStacks +
      this.consumedAtLowStacks +
      this.wastedExpires +
      this.wastedRefreshes
    );
  }

  private get consumedProcs() {
    return this.consumedAtFullStacks + this.consumedAtLowStacks;
  }

  private get usageRate() {
    return this.totalProcs > 0 ? this.consumedProcs / this.totalProcs : 1;
  }

  private get usagePerformance(): QualitativePerformance {
    if (this.totalProcs === 0) {
      return QualitativePerformance.Perfect;
    }
    return evaluateQualitativePerformanceByThreshold({
      actual: this.usageRate,
      isGreaterThanOrEqual: {
        perfect: 0.95,
        good: 0.85,
        ok: 0.7,
      },
    });
  }

  private get stackPerformance(): QualitativePerformance {
    if (this.consumedProcs === 0) {
      return QualitativePerformance.Perfect;
    }
    const fullStackRate = this.consumedAtFullStacks / this.consumedProcs;
    return evaluateQualitativePerformanceByThreshold({
      actual: fullStackRate,
      isGreaterThanOrEqual: {
        perfect: 0.95,
        good: 0.85,
        ok: 0.7,
      },
    });
  }

  private buildOverviewStats(): StatisticData[] {
    return [
      {
        value: `${this.totalProcs}`,
        label: 'Total Procs',
        tooltip: (
          <>
            Total <SpellLink spell={SPELLS.TEMPEST_BUFF} /> procs gained during the fight.
          </>
        ),
      },
      {
        value: `${this.consumedProcs}/${this.totalProcs}`,
        label: 'Procs Used',
        tooltip: (
          <>
            <SpellLink spell={SPELLS.TEMPEST_BUFF} /> procs consumed before they expired or were
            overwritten.
          </>
        ),
        performance: this.usagePerformance,
      },
      {
        value: `${this.consumedAtFullStacks}/${this.consumedProcs}`,
        label: 'Full MSW',
        tooltip: (
          <>
            <SpellLink spell={SPELLS.TEMPEST_CAST} /> casts consumed at full{' '}
            <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> stacks ({FULL_MSW_STACKS}). Free
            casts from <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> are counted as full.
          </>
        ),
        performance: this.stackPerformance,
      },
      {
        value: `${this.wastedExpires}`,
        label: 'Expired',
        tooltip: (
          <>
            <SpellLink spell={SPELLS.TEMPEST_BUFF} /> procs that fell off without being used.
          </>
        ),
        performance:
          this.wastedExpires === 0 ? QualitativePerformance.Perfect : QualitativePerformance.Fail,
      },
      {
        value: `${this.wastedRefreshes}`,
        label: 'Overwritten',
        tooltip: (
          <>
            <SpellLink spell={SPELLS.TEMPEST_BUFF} /> procs replaced by a new proc before being
            used.
          </>
        ),
        performance:
          this.wastedRefreshes === 0 ? QualitativePerformance.Perfect : QualitativePerformance.Fail,
      },
    ];
  }

  private description(): JSX.Element {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS.TEMPEST_TALENT} />
          </strong>{' '}
          procs replace your next <SpellLink spell={TALENTS.MAELSTROM_WEAPON_TALENT} /> spender with
          a <SpellLink spell={SPELLS.TEMPEST_CAST} />.
        </p>
        <p>
          Letting a <SpellLink spell={SPELLS.TEMPEST_BUFF} /> proc expire or overwriting it with a
          new one is a significant damage loss.
        </p>
      </>
    );
  }

  get guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    return (
      <GuideSection spell={TALENTS.TEMPEST_TALENT} explanation={this.description()}>
        <CastOverview spell={TALENTS.TEMPEST_TALENT} stats={this.buildOverviewStats()} />
      </GuideSection>
    );
  }
}

export default Tempest;
