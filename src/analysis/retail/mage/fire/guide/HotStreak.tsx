import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import GuideSection from 'interface/guide/components/GuideSection';

import HotStreak from '../core/HotStreak';

const LOW_BLAST_CHARGES = 1;

class HotStreakGuide extends Analyzer {
  static dependencies = {
    hotStreak: HotStreak,
  };

  protected hotStreak!: HotStreak;

  hasFlameOn: boolean = this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT);

  private evaluateHotStreakProc(hs: any): CastEvaluation {
    const lowBlastCharges = hs.blastCharges <= LOW_BLAST_CHARGES;

    // FAIL CONDITIONS
    if (hs.expired) {
      return {
        timestamp: hs.remove.timestamp,
        performance: QualitativePerformance.Fail,
        reason: 'Hot Streak Proc Expired - significant DPS loss',
      };
    }

    // GOOD CONDITIONS
    if (hs.critBuff.active && hs.critBuff.buffId) {
      const buffName =
        hs.critBuff.buffId === TALENTS.SCORCH_TALENT.id
          ? 'Searing Touch'
          : SPELLS[hs.critBuff.buffId]?.name || 'Unknown Buff';
      return {
        timestamp: hs.remove.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Good - Had Guaranteed Crit Buff: ${buffName}`,
      };
    }

    if (!hs.precast || (hs.precast && lowBlastCharges)) {
      return {
        timestamp: hs.remove.timestamp,
        performance: QualitativePerformance.Good,
        reason: 'Good - Used Hot Streak proc properly',
      };
    }

    // OK CONDITIONS
    if (hs.precast && !lowBlastCharges) {
      return {
        timestamp: hs.remove.timestamp,
        performance: QualitativePerformance.Ok,
        reason: 'Precast Found with Fire Blast or Phoenix Flames Charges Available',
      };
    }

    // DEFAULT
    return {
      timestamp: hs.remove.timestamp,
      performance: QualitativePerformance.Ok,
      reason: 'Hot Streak proc used',
    };
  }

  get guideSubsection(): JSX.Element {
    const combustion = <SpellLink spell={TALENTS.COMBUSTION_TALENT} />;
    const heatingUp = <SpellLink spell={SPELLS.HEATING_UP} />;
    const hotStreak = <SpellLink spell={SPELLS.HOT_STREAK} />;
    const fireball = <SpellLink spell={SPELLS.FIREBALL} />;
    const pyroblast = <SpellLink spell={TALENTS.PYROBLAST_TALENT} />;
    const flamestrike = <SpellLink spell={SPELLS.FLAMESTRIKE} />;
    const ignite = <SpellLink spell={SPELLS.IGNITE} />;

    const explanation = (
      <>
        <b>{hotStreak}</b> makes your next {pyroblast} or {flamestrike} instant cast, making it a
        large contributor to your direct damage and ticking {ignite} damage. The majority of your
        rotation revolves around getting as many of these procs as possible.
        <ul>
          <li>Use your procs and don't let them expire.</li>
          <li>
            You can't generate {heatingUp} while you have {hotStreak}, so spend {hotStreak} quickly
            to avoid wasted crits.
          </li>
          <li>
            If low on charges outside of {combustion}, you can precast {fireball} or {pyroblast}{' '}
            immediately before spending {hotStreak} to fish for {heatingUp} or another {hotStreak}.
          </li>
        </ul>
      </>
    );

    return (
      <GuideSection spell={SPELLS.HOT_STREAK} explanation={explanation}>
        <CastSummary
          spell={SPELLS.HOT_STREAK}
          casts={this.hotStreak.hotStreaks.map((proc) => this.evaluateHotStreakProc(proc))}
          showBreakdown
        />
      </GuideSection>
    );
  }
}

export default HotStreakGuide;
