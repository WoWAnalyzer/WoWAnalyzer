import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer from 'parser/core/Analyzer';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import type { JSX } from 'react';
import { SpellLink } from 'interface';
import GuideSection from 'interface/guide/components/GuideSection';
import EssenceBreak, { type EssenceBreakCastData } from '../modules/talents/EssenceBreak';

class EssenceBreakGuide extends Analyzer {
  static dependencies = {
    essenceBreak: EssenceBreak,
  };

  protected essenceBreak!: EssenceBreak;

  private evaluateEssenceBreakCast(cast: EssenceBreakCastData) {
    const eyeBeamAvailable = cast.eyebeamCooldown < 4000;

    // Perfect Conditions
    if ((cast.hasMetamorphosisOnCast || !eyeBeamAvailable) && cast.buffedCasts >= 6) {
      return {
        timestamp: cast.event.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: `Essence Break was cast in Metamorphosis or no Eyebeam was available and 6 or more casts were buffed`,
      };
    }

    // Good Conditions
    if ((cast.hasMetamorphosisOnCast || !eyeBeamAvailable) && cast.buffedCasts >= 3) {
      return {
        timestamp: cast.event.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Essence Break was cast in Metamorphosis or no Eyebeam was available and 3 or more casts were buffed`,
      };
    }

    // OK Conditions
    if (cast.hasMetamorphosisOnCast || !eyeBeamAvailable) {
      return {
        timestamp: cast.event.timestamp,
        performance: QualitativePerformance.Ok,
        reason: `Essence Break had less than 3 buffed casts`,
      };
    }

    // Fail Conditions
    if ((!cast.hasMetamorphosisOnCast && eyeBeamAvailable) || cast.unbuffedCasts > 3) {
      return {
        timestamp: cast.event.timestamp,
        performance: QualitativePerformance.Fail,
        reason: `You did not hold for Eye Beam that was coming up soon or you did not buff more than 3 of your abilities with Essence Break`,
      };
    }

    // Default Fail
    return {
      timestamp: cast.event.timestamp,
      performance: QualitativePerformance.Fail,
      reason: `Performance Condition Unknown. Please report this!`,
    };
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT} />
          </strong>{' '}
          is a frontal cone that does damage on impact and leaves a debuff on all enemies hit.
          Enemies with this debuff take additional damage from your{' '}
          <SpellLink spell={SPELLS.CHAOS_STRIKE} />, <SpellLink spell={SPELLS.ANNIHILATION} />,{' '}
          <SpellLink spell={SPELLS.BLADE_DANCE} />, and <SpellLink spell={SPELLS.DEATH_SWEEP} />.
        </p>
        <p>
          This is <b>not</b> a damage amp, it is flat additional damage. That means no matter which
          spell you use, it will deal the same amount of extra damage.
        </p>
      </>
    );

    const perCastData: PerCastData[] = this.essenceBreak.casts.map((cast) => {
      const evaluation = this.evaluateEssenceBreakCast(cast);
      let stats: PerCastStat[];
      if (cast.hits < 1) {
        stats = [
          {
            label: 'Targets Hit',
            value: `${cast.hits}`,
            tooltip: 'No enemies were hit - cooldown wasted',
            performance: QualitativePerformance.Fail,
          },
        ];
      } else {
        stats = [
          {
            label: 'Targets Hit',
            value: `${cast.hits}`,
            tooltip: 'Number of targets hit by the initial cast',
          },
          {
            label: 'In Metamorphosis',
            value: `${cast.hasMetamorphosisOnCast ? 'Yes' : 'No'}`,
            tooltip: 'If you were in Meta during this Essence Break window',
            performance: cast.hasMetamorphosisOnCast
              ? QualitativePerformance.Perfect
              : QualitativePerformance.Good,
          },
          {
            label: 'Eye Beam Available',
            value: `${cast.eyebeamCooldown < 4000 ? 'Yes' : 'No'}`,
            tooltip:
              'Was Eyebeam up within 4 seconds of this cast? (If yes, you should have used it)',
            performance:
              cast.eyebeamCooldown < 4000
                ? QualitativePerformance.Fail
                : QualitativePerformance.Perfect,
          },
          cast.buffedCasts > 0
            ? {
                label: 'Buffed Casts',
                value: `${cast.buffedCasts}`,
                tooltip: 'Number of casts that benefited from the debuff',
              }
            : undefined,
          cast.deathSweepCasts > 0
            ? {
                label: 'Buffed Death Sweep Casts',
                value: `${cast.deathSweepCasts}`,
                tooltip: 'Number of Death Sweep casts that benefited from the debuff',
              }
            : undefined,
          cast.annihilationCasts > 0
            ? {
                label: 'Buffed Annihilation Casts',
                value: `${cast.annihilationCasts}`,
                tooltip: 'Number of Annihilation casts that benefited from the debuff',
              }
            : undefined,
          cast.bladeDanceCasts > 0
            ? {
                label: 'Buffed Blade Dance Casts',
                value: `${cast.bladeDanceCasts}`,
                tooltip: 'Number of Blade Dance casts that benefited from the debuff',
              }
            : undefined,
          cast.chaosStrikeCasts > 0
            ? {
                label: 'Buffed Chaos Strike Casts',
                value: `${cast.chaosStrikeCasts}`,
                tooltip: 'Number of Chaos Strike casts that benefited from the debuff',
              }
            : undefined,
        ].filter(Boolean) as PerCastStat[];
      }

      return {
        performance: evaluation.performance,
        details: evaluation.reason,
        timestamp: this.owner.formatTimestamp(cast.event.timestamp),
        stats,
      };
    });

    return (
      <GuideSection
        spell={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT}
        explanation={explanation}
        title="Essence Break"
      >
        <CastDetail title="Essence Break Casts" casts={perCastData} />
      </GuideSection>
    );
  }
}

export default EssenceBreakGuide;
