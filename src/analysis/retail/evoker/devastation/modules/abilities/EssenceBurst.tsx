import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import { getEssenceBurstConsumeAbility } from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import { AnalysisData } from '../../../shared/modules/components/ProcAnalysis';
import { StackedBar, StackedBarSegment } from 'interface/guide/components';
import SpellLink from 'interface/SpellLink';
import ProcBuffAnalyzer, {
  BuffRemoveEvent,
} from 'analysis/retail/evoker/shared/modules/core/ProcBuffAnalyzer';

class EssenceBurst extends ProcBuffAnalyzer<CastEvent> {
  spenders = { Disintegrate: 0, Pyre: 0 };

  constructor(options: Options) {
    const hasAttunement = options.owner.selectedCombatant.hasTalent(
      TALENTS_EVOKER.ESSENCE_ATTUNEMENT_TALENT,
    );
    super(options, { buff: SPELLS.ESSENCE_BURST_DEV_BUFF, maxStacks: hasAttunement ? 2 : 1 });
  }

  protected getConsumeEvent(event: BuffRemoveEvent) {
    return getEssenceBurstConsumeAbility(event) ?? undefined;
  }

  protected onStacksConsumed(event: BuffRemoveEvent, castEvent: CastEvent) {
    if (castEvent.ability.guid === SPELLS.DISINTEGRATE.id) {
      this.spenders.Disintegrate += 1;
    } else {
      this.spenders.Pyre += 1;
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
      spell: this.buff,
      additionalContent: {
        title: 'Spender Breakdown',
        content: <StackedBar segments={this.buildSpenderBar()} />,
      },
    };
  }
}

export default EssenceBurst;
