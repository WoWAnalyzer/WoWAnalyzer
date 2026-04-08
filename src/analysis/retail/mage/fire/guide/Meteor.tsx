import type { JSX } from 'react';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import GuideSection from 'interface/guide/components/GuideSection';

import Meteor, { MeteorCasts } from '../talents/Meteor';
import { formatDurationMillisMinSec } from 'common/format';

class MeteorGuide extends Analyzer {
  static dependencies = {
    meteor: Meteor,
  };
  protected meteor!: Meteor;

  hasBurnout: boolean = this.selectedCombatant.hasTalent(TALENTS.BURNOUT_TALENT);
  hasBlastZone: boolean = this.selectedCombatant.hasTalent(TALENTS.BLAST_ZONE_TALENT);

  private evaluateMeteor(m: MeteorCasts): CastEvaluation {
    // FAIL CONDITIONS
    if (m.targetsHit === 0) {
      return {
        timestamp: m.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: 'Meteor did not hit any targets.',
      };
    }

    if (!this.hasBlastZone && !m.landedDuringCombust) {
      return {
        timestamp: m.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: 'Meteor did not land inside of Combustion',
      };
    }

    // PERFECT CONDITIONS
    if (this.hasBurnout && m.landedDuringCombust && (m.timeTillCombustEnd ?? Infinity) < 8000) {
      return {
        timestamp: m.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Meteor landed within Burnout range (${formatDurationMillisMinSec(m.timeTillCombustEnd!)} until Combust Ends)`,
      };
    }

    // GOOD CONDITIONS
    if (this.hasBlastZone && !m.landedDuringCombust && m.timeTillCombust > 20000) {
      return {
        timestamp: m.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: 'Good Meteor Cast',
      };
    }

    if (m.landedDuringCombust) {
      return {
        timestamp: m.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Meteor landed during Combustion.`,
      };
    }

    // DEFAULT
    return {
      timestamp: m.cast.timestamp,
      performance: QualitativePerformance.Fail,
      reason: 'Unknown Performance Condition (Please report this)',
    };
  }

  get guideSubsection(): JSX.Element {
    const meteor = <SpellLink spell={TALENTS.METEOR_TALENT} />;
    const combustion = <SpellLink spell={TALENTS.COMBUSTION_TALENT} />;
    const burnout = <SpellLink spell={TALENTS.BURNOUT_TALENT} />;
    const blastZone = <SpellLink spell={TALENTS.BLAST_ZONE_TALENT} />;

    const explanation = (
      <>
        <b>{meteor}</b> is on somewhat of an awkward cooldown cadence, so it is primarily used to
        prop up your {combustion} damage. As a result, you will often be holding {meteor} to ensure
        it lines up with {combustion}. Refer to the below guidelines to get the most out of {meteor}
        .
        <ul>
          <li>
            Ensure you are aiming {meteor} so that it will hit your primary target and as many
            additional targets as possible.
          </li>
          {this.hasBurnout && (
            <li>
              If you have {burnout}, you should ensure {meteor} lands within 8 seconds of{' '}
              {combustion} ending, so the {burnout} explosion includes {meteor}'s ignite
              contributions.
            </li>
          )}
          {!this.hasBurnout && (
            <li>
              Without {burnout}, you should cast {meteor} just before you activate {combustion},
              ensuring {meteor} lands after {combustion} is activated.
            </li>
          )}
          {this.hasBlastZone && (
            <li>
              If you have {blastZone}, it is acceptable to cast {meteor} outside of {combustion} as
              long as it will be available again for {combustion}
            </li>
          )}
        </ul>
      </>
    );

    return (
      <GuideSection spell={TALENTS.METEOR_TALENT} explanation={explanation}>
        <CastSummary
          spell={TALENTS.METEOR_TALENT}
          casts={this.meteor.meteors.map((m) => this.evaluateMeteor(m))}
          showBreakdown
        />
      </GuideSection>
    );
  }
}

export default MeteorGuide;
