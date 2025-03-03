import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EmpowerEndEvent } from 'parser/core/Events';
import { TIERS } from 'game/TIERS';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ContextualSpellUsageSubSection from 'parser/core/SpellUsage/HideGoodCastsSpellUsageSubSection';
import SpellLink from 'interface/SpellLink';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';

type UpheavalCast = {
  event: EmpowerEndEvent;
  essenceBurstStacks: number;
};
/**
 * (4) Set Augmentation: Upheavals have a 50% chance to grant Essence Burst. Essence Burst Eruptions deal 25% increased damage.
 */
class T33Augmentation4P extends Analyzer {
  private uses: SpellUse[] = [];
  private upheavalCasts: UpheavalCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.has4PieceByTier(TIERS.TWW2) &&
      this.selectedCombatant.hasTalent(TALENTS.ROCKFALL_TALENT);

    this.addEventListener(
      Events.empowerEnd.by(SELECTED_PLAYER).spell([TALENTS.UPHEAVAL_TALENT, SPELLS.UPHEAVAL_FONT]),
      this.onUpheavalCast,
    );

    this.addEventListener(Events.fightend, this.finalize);
  }

  onUpheavalCast(event: EmpowerEndEvent) {
    const essenceBurstStacks = this.selectedCombatant.getBuffStacks(
      SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF,
    );

    this.upheavalCasts.push({
      event,
      essenceBurstStacks,
    });
  }

  private finalize() {
    // finalize performances
    this.uses = this.upheavalCasts.map((upheavalCast) => this.upheavalUsage(upheavalCast));
  }

  private upheavalUsage(upheavalCast: UpheavalCast): SpellUse {
    const summary = (
      <div>
        <SpellLink spell={SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF} /> stacks
      </div>
    );
    let performance = null;
    let details = null;
    if (upheavalCast.essenceBurstStacks === 2) {
      performance = QualitativePerformance.Fail;
      details = (
        <div>
          You cast <SpellLink spell={TALENTS.UPHEAVAL_TALENT} /> at 2 stacks of{' '}
          <SpellLink spell={SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF} />, which is likely to waste
          Essence Burst procs.
        </div>
      );
    } else if (upheavalCast.essenceBurstStacks === 1) {
      performance = QualitativePerformance.Good;
      details = (
        <div>
          You cast <SpellLink spell={TALENTS.UPHEAVAL_TALENT} /> at 1 stacks of{' '}
          <SpellLink spell={SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF} />.
        </div>
      );
    } else {
      performance = QualitativePerformance.Perfect;
      details = (
        <div>
          You cast <SpellLink spell={TALENTS.UPHEAVAL_TALENT} /> without any{' '}
          <SpellLink spell={SPELLS.ESSENCE_BURST_AUGMENTATION_BUFF} /> stacks. Good job!
        </div>
      );
    }
    const checklistItems: ChecklistUsageInfo[] = [
      {
        check: 'possible-extends',
        timestamp: upheavalCast.event.timestamp,
        performance,
        summary,
        details,
      },
    ];
    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );
    return {
      event: upheavalCast.event,
      performance: actualPerformance,
      checklistItems,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }

  guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <section>
        <SpellLink spell={TALENTS.ROCKFALL_TALENT} /> and Augmentation's Undermine 4 set bonus each
        give you a high chance to generate a stack of{' '}
        <SpellLink spell={TALENTS.ESSENCE_BURST_AUGMENTATION_TALENT} /> when casting{' '}
        <SpellLink spell={TALENTS.UPHEAVAL_TALENT} />. For this reason, you should avoid casting it
        when you already have 2 stacks of Essence Burst, as this is likely to waste Essence Burst
        procs.
      </section>
    );

    return (
      <ContextualSpellUsageSubSection
        title="Upheaval Essence Burst"
        explanation={explanation}
        uses={this.uses}
        castBreakdownSmallText={
          <> - These boxes represent each cast, colored by how good the usage was.</>
        }
        abovePerformanceDetails={<div style={{ marginBottom: 10 }}></div>}
      />
    );
  }
}

export default T33Augmentation4P;
