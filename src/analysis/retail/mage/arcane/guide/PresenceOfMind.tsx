import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Analyzer from 'parser/core/Analyzer';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import GuideSection from 'interface/guide/components/GuideSection';

import PresenceOfMind, { PresenceOfMindData } from '../analyzers/PresenceOfMind';
import { formatDurationMillisMinSec } from 'common/format';

class PresenceOfMindGuide extends Analyzer {
  static dependencies = {
    presenceOfMind: PresenceOfMind,
  };

  protected presenceOfMind!: PresenceOfMind;

  private evaluatePresenceOfMindCast(cast: PresenceOfMindData): CastEvaluation {
    // Fail conditions
    if (cast.charges > 2) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `Had ${cast.charges} Arcane Charges.`,
      };
    }

    if (cast.orbCharges > 0) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `Had Arcane Orb Available`,
      };
    }

    if (cast.clearcasting) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `Had Clearcasting.`,
      };
    }

    if (cast.orbCD < 5000) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `Arcane Orb had ${formatDurationMillisMinSec(cast.orbCD)} remaining on its cooldown.`,
      };
    }

    if (cast.stacksUsed < 2) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `Used ${cast.stacksUsed} stacks.`,
      };
    }

    // Good conditions
    if (
      cast.charges < 2 &&
      !cast.clearcasting &&
      cast.orbCharges === 0 &&
      cast.orbCD < 5000 &&
      cast.stacksUsed === 2
    ) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Used both stacks with ${cast.charges} Arcane Charges and without Clearcasting or Arcane Orb.`,
      };
    }

    // Default condition
    return {
      timestamp: cast.cast.timestamp,
      performance: QualitativePerformance.Fail,
      reason: `Unknown Performance Condition. Please report this!!`,
    };
  }

  get guideSubsection(): JSX.Element {
    const presenceOfMind = <SpellLink spell={TALENTS.PRESENCE_OF_MIND_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneOrb = <SpellLink spell={TALENTS.ARCANE_ORB_TALENT} />;
    const clearcasting = <SpellLink spell={SPELLS.CLEARCASTING_ARCANE} />;

    const explanation = (
      <>
        <b>{presenceOfMind}</b> is a fairly simple ability that makes your next two {arcaneBlast}{' '}
        casts instant. There is not much to play around here, so you should generally cast this when
        all of the below are true to avoid hardcasting {arcaneBlast} with low {arcaneCharge}s.
        <ul>
          <li>You have &lt; 2 {arcaneCharge}s</li>
          <li>
            You do not have {arcaneOrb} or {clearcasting}
          </li>
          <li>{arcaneOrb} will not be available in the next 5 seconds.</li>
        </ul>
      </>
    );

    return (
      <GuideSection spell={TALENTS.PRESENCE_OF_MIND_TALENT} explanation={explanation}>
        <CastSummary
          spell={TALENTS.PRESENCE_OF_MIND_TALENT}
          casts={this.presenceOfMind.pomData.map((cast) => this.evaluatePresenceOfMindCast(cast))}
          showBreakdown
        />
      </GuideSection>
    );
  }
}

export default PresenceOfMindGuide;
