import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { getEssenceBurstConsumeAbility } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { AnalysisData } from '../../../shared/modules/components/ProcAnalysis';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { StackedBar, StackedBarSegment } from 'interface/guide/components';
import SpellLink from 'interface/SpellLink';
import ProcBuffAnalyzer, {
  ProcBuffAnalyzerOptions,
} from 'analysis/retail/evoker/shared/modules/core/ProcBuffAnalyzer';

const ProcBuffOptions: ProcBuffAnalyzerOptions = {
  trackedBuffs: [TALENTS_EVOKER.RUBY_ESSENCE_BURST_TALENT, SPELLS.ESSENCE_BURST_DEV_BUFF],
  inactiveListeners: {},
};

class EssenceBurst extends ProcBuffAnalyzer {
  spenders = { Disintegrate: 0, Pyre: 0 };
  maxStacks = this.selectedCombatant.hasTalent(TALENTS_EVOKER.ESSENCE_ATTUNEMENT_TALENT) ? 2 : 1;

  constructor(options: Options) {
    super(options, ProcBuffOptions);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    return;
  }
  onApplyBuffStack(event: ApplyBuffStackEvent) {
    return;
  }
  onRefreshBuff(event: RefreshBuffEvent): void {
    return;
  }
  onRemoveBuff(event: RemoveBuffEvent) {
    this.onEssenceBurstConsume(event);
  }
  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.onEssenceBurstConsume(event);
  }
  onEssenceBurstConsume(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const castEvent = getEssenceBurstConsumeAbility(event);
    if (castEvent !== null) {
      if (castEvent.ability.guid === SPELLS.DISINTEGRATE.id) {
        this.spenders.Disintegrate += 1;
      } else {
        this.spenders.Pyre += 1;
      }
      this.pushCastData(event, 'Buff used', QualitativePerformance.Good);
    } else {
      this.pushCastData(
        event,
        `Buff expired wasting ${this.stackDifference} stack(s)`,
        QualitativePerformance.Fail,
      );
    }
  }

  private buildSpenderBar(): StackedBarSegment[] {
    return [
      {
        label: 'Disintegrate',
        value: this.spenders.Disintegrate,
        color: 'hsl(190, 70%, 55%)',
        tooltip: (
          <>
            {this.spenders.Disintegrate} <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> spent on{' '}
            <SpellLink spell={SPELLS.DISINTEGRATE} />
          </>
        ),
      },
      {
        label: 'Pyre',
        value: this.spenders.Pyre,
        color: 'hsl(20, 70%, 55%)',
        tooltip: (
          <>
            {this.spenders.Pyre} <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> spent on{' '}
            <SpellLink spell={SPELLS.PYRE} />
          </>
        ),
      },
    ];
  }

  get procUsageData(): AnalysisData {
    return {
      casts: this.casts,
      spell: SPELLS.ESSENCE_BURST_DEV_BUFF,
      additionalContent: {
        title: 'Spender Breakdown',
        content: <StackedBar segments={this.buildSpenderBar()} />,
      },
    };
  }
}

export default EssenceBurst;
