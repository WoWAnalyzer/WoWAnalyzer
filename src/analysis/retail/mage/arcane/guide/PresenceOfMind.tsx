import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Analyzer from 'parser/core/Analyzer';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import GuideSection from 'interface/guide/components/GuideSection';

import PresenceOfMind, { PresenceOfMindData } from '../analyzers/PresenceOfMind';

const AOE_TARGET_THRESHOLD = 4;
const CAST_DELAY_THRESHOLD = 500; // 500ms

class PresenceOfMindGuide extends Analyzer {
  static dependencies = {
    presenceOfMind: PresenceOfMind,
  };

  protected presenceOfMind!: PresenceOfMind;

  private evaluatePresenceOfMindCast(cast: PresenceOfMindData): CastEvaluation {
    const ST = cast.targets && cast.targets < AOE_TARGET_THRESHOLD;
    const AOE = cast.targets && cast.targets >= AOE_TARGET_THRESHOLD;
    const touchAtEnd = cast.usedTouchEnd;
    const aoeCharges = cast.charges === 2 || cast.charges === 3;
    const hasDelayIssue = cast.touchCancelDelay && cast.touchCancelDelay > CAST_DELAY_THRESHOLD;

    // Fail conditions
    if (ST && !touchAtEnd) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: 'Not used at Touch end - should squeeze extra casts into Touch of the Magi window',
      };
    }
    if (AOE && !aoeCharges) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `${cast.charges} charges (should be 2-3 for AoE) - use at proper charge count for faster Barrage"`,
      };
    }
    if (hasDelayIssue) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Fail,
        reason: cast.touchCancelDelay
          ? `${cast.touchCancelDelay.toFixed(2)}ms delay - significant clipping issue`
          : '',
      };
    }

    // Perfect conditions
    if (
      ST &&
      touchAtEnd &&
      (!cast.touchCancelDelay || cast.touchCancelDelay <= CAST_DELAY_THRESHOLD)
    ) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: 'Perfect - used at Touch end with proper timing',
      };
    }
    if (AOE && aoeCharges) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Perfect - ${cast.charges} charges for AoE (optimal for faster Barrage)"`,
      };
    }

    // Good conditions
    if (ST && touchAtEnd) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: 'Good - used at Touch end to squeeze extra casts',
      };
    }
    if (AOE && aoeCharges) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Good - ${cast.charges} charges for AoE usage"`,
      };
    }
    if (!cast.touchCancelDelay || cast.touchCancelDelay <= CAST_DELAY_THRESHOLD) {
      return {
        timestamp: cast.cast.timestamp,
        performance: QualitativePerformance.Good,
        reason: cast.touchCancelDelay
          ? `${cast.touchCancelDelay.toFixed(2)}ms delay - acceptable timing`
          : 'Good timing',
      };
    }

    // Ok/informational condition
    return {
      timestamp: cast.cast.timestamp,
      performance: QualitativePerformance.Ok,
      reason: `Used with ${cast.charges} charges, ${cast.stacksUsed} stacks, ${cast.targets ? cast.targets : 'unknown'} targets hit by next Barrage`,
    };
  }

  get guideSubsection(): JSX.Element {
    const presenceOfMind = <SpellLink spell={TALENTS.PRESENCE_OF_MIND_TALENT} />;
    const arcaneBlast = <SpellLink spell={SPELLS.ARCANE_BLAST} />;
    const touchOfTheMagi = <SpellLink spell={TALENTS.TOUCH_OF_THE_MAGI_TALENT} />;
    const arcaneCharge = <SpellLink spell={SPELLS.ARCANE_CHARGE} />;
    const arcaneBarrage = <SpellLink spell={SPELLS.ARCANE_BARRAGE} />;

    const explanation = (
      <>
        <b>{presenceOfMind}</b> is a simple ability whos primary benefit is squeezing a couple extra
        casts into a tight buff window or getting to a harder hitting ability faster. So while it
        itself is not a major damage ability, it can help you get a little bit more out of your
        other abilities. Use the below guidelines to add these benefits to your rotation.
        <ul>
          <li>
            In Single Target, you should use {presenceOfMind} to squeeze a couple extra casts into
            the final couple seconds of {touchOfTheMagi}
          </li>
          <li>
            If you are unable to finish both {arcaneBlast} casts before {touchOfTheMagi} ends,
            cancel the {presenceOfMind} buff so it's cooldown stays in sync with {touchOfTheMagi}
          </li>
          <li>
            In AOE, you can use {presenceOfMind} at 2 or 3 {arcaneCharge}s to get to {arcaneBarrage}{' '}
            (with 4 {arcaneCharge}s) faster.
          </li>
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
