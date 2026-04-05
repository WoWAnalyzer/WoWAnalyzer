import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Analyzer from 'parser/core/Analyzer';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import GuideSection from 'interface/guide/components/GuideSection';

import Clearcasting, { ClearcastingData } from '../analyzers/Clearcasting';

class ClearcastingGuide extends Analyzer {
  static dependencies = {
    clearcasting: Clearcasting,
  };

  protected clearcasting!: Clearcasting;

  private evaluateClearcastingProc(cc: ClearcastingData): CastEvaluation {
    // Fail conditions (highest priority)
    if (cc.expired) {
      return {
        timestamp: cc.applied,
        performance: QualitativePerformance.Fail,
        reason: 'Clearcasting expired.',
      };
    }

    // Perfect conditions
    if (cc.spender) {
      return {
        timestamp: cc.applied,
        performance: QualitativePerformance.Perfect,
        reason: `Clearcasting used on ${cc.spender.ability.name}.`,
      };
    }

    // Default
    return {
      timestamp: cc.applied,
      performance: QualitativePerformance.Fail,
      reason: 'Clearcasting proc not handled properly',
    };
  }

  get guideSubsection(): JSX.Element {
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;
    const arcaneMissiles = <SpellLink spell={TALENTS.ARCANE_MISSILES_TALENT} />;
    const arcaneExplosion = <SpellLink spell={SPELLS.ARCANE_EXPLOSION} />;

    const explanation = (
      <>
        <b>{clearcasting}</b> is a proc that interacts with {arcaneMissiles} and {arcaneExplosion}.
        Refer to the various rotational sections above for guidance on how to utilize {clearcasting}{' '}
        in your rotation. Beyond that, you should just ensure your {clearcasting} procs are not
        expiring and are not overcapping.
      </>
    );

    return (
      <GuideSection spell={SPELLS.CLEARCASTING_ARCANE} explanation={explanation}>
        <CastSummary
          spell={SPELLS.CLEARCASTING_ARCANE}
          casts={this.clearcasting.clearcastingProcs.map((proc) =>
            this.evaluateClearcastingProc(proc),
          )}
          showBreakdown
        />
      </GuideSection>
    );
  }
}

export default ClearcastingGuide;
