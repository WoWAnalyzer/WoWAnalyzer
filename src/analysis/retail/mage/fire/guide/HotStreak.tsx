import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummary, { type CastEvaluation } from 'interface/guide/components/CastSummary';
import GuideSection from 'interface/guide/components/GuideSection';

import HotStreak from '../core/HotStreak';
import { CastOverview, StackedBar, type StackedBarSegment } from 'interface/guide/components';
import { formatDurationMillisMinSec } from 'common/format';

class HotStreakGuide extends Analyzer {
  static dependencies = {
    hotStreak: HotStreak,
  };

  protected hotStreak!: HotStreak;

  isFrostfire: boolean = this.selectedCombatant.hasTalent(TALENTS.FROSTFIRE_BOLT_TALENT);

  private buildStats() {
    const stats = [];

    const totalUptime = this.selectedCombatant.getBuffUptime(SPELLS.HOT_STREAK);
    const averageUptime = totalUptime / this.hotStreak.hotStreaks.length;

    stats.push({
      value: `${this.hotStreak.expiredProcs}`,
      label: 'Expired Procs',
      tooltip: <>Number of Hot Streak procs that expired before they could be spent.</>,
      performance: this.hotStreak.expiredProcsPerformance,
    });
    stats.push({
      value: `${this.hotStreak.wastedCrits.length}`,
      label: 'Wasted Crits',
      tooltip: (
        <>
          Number of times a direct damage fire spell crit against your target while you already had
          Hot Streak.
        </>
      ),
      performance: this.hotStreak.wastedCritsPerformance,
    });
    stats.push({
      value: formatDurationMillisMinSec(averageUptime, 2),
      label: 'Average Proc Uptime',
      tooltip: <>Average amount of time Hot Streak was active before it was used (or expired).</>,
    });

    return stats;
  }

  private buildSpenderBar(): StackedBarSegment[] {
    const pyroblastCount = this.hotStreak.hotStreaks.filter(
      (hs) => hs.spender?.ability.guid === TALENTS.PYROBLAST_TALENT.id,
    ).length;
    const flamestrikeCount = this.hotStreak.hotStreaks.filter(
      (hs) => hs.spender?.ability.guid === SPELLS.FLAMESTRIKE.id,
    ).length;

    return [
      {
        label: 'Pyroblast',
        value: pyroblastCount,
        color: '#e38d4b',
        tooltip: <>{pyroblastCount} Hot Streak procs spent on Pyroblast</>,
      },
      {
        label: 'Flamestrike',
        value: flamestrikeCount,
        color: '#a84444',
        tooltip: <>{flamestrikeCount} Hot Streak procs spent on Flamestrike</>,
      },
    ];
  }

  private evaluateHotStreakProc(hs: any): CastEvaluation {
    // FAIL CONDITIONS
    if (hs.expired) {
      return {
        timestamp: hs.remove.timestamp,
        performance: QualitativePerformance.Fail,
        reason: 'Hot Streak Proc Expired',
      };
    }

    // GOOD CONDITIONS
    if (hs.activeBuffs.length > 0) {
      const buffs = hs.activeBuffs.map((buff: Spell) => buff.name);
      return {
        timestamp: hs.remove.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Had Guaranteed Crit Buff: ${buffs}`,
      };
    }

    if (hs.precast) {
      return {
        timestamp: hs.remove.timestamp,
        performance: QualitativePerformance.Good,
        reason: `Hot Streak used with precast (${hs.precast.ability.name})`,
      };
    }

    // OK CONDITIONS
    if (!hs.precast) {
      return {
        timestamp: hs.remove.timestamp,
        performance: QualitativePerformance.Ok,
        reason: 'Hot Streak used without a precast or guaranteed crit buff',
      };
    }

    // DEFAULT
    return {
      timestamp: hs.remove.timestamp,
      performance: QualitativePerformance.Fail,
      reason: 'Unknown Performance Condition (Please report this).',
    };
  }

  get guideSubsection(): JSX.Element {
    const combustion = <SpellLink spell={TALENTS.COMBUSTION_TALENT} />;
    const firestarter = <SpellLink spell={TALENTS.FIRESTARTER_TALENT} />;
    const heatingUp = <SpellLink spell={SPELLS.HEATING_UP} />;
    const hotStreak = <SpellLink spell={SPELLS.HOT_STREAK} />;
    const fireball = <SpellLink spell={SPELLS.FIREBALL} />;
    const frostfireBolt = <SpellLink spell={TALENTS.FROSTFIRE_BOLT_TALENT} />;
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
            When you have {hotStreak} and are not guaranteed to crit, you should cast{' '}
            {this.isFrostfire ? frostfireBolt : fireball} immediately before your instant{' '}
            {pyroblast} to increase the chance of getting another {heatingUp} or {hotStreak}.
          </li>
          <li>
            If you have {hotStreak} and are guaranteed to crit via {combustion} or {firestarter} you
            can press {pyroblast} twice at the end of your{' '}
            {this.isFrostfire ? frostfireBolt : fireball} cast since both spells will crit and
            immediately give you another {hotStreak}.
          </li>
        </ul>
      </>
    );

    return (
      <GuideSection spell={SPELLS.HOT_STREAK} explanation={explanation}>
        <CastOverview
          spell={SPELLS.HOT_STREAK}
          stats={this.buildStats()}
          additionalContent={{
            title: 'Spender Breakdown',
            content: <StackedBar segments={this.buildSpenderBar()} />,
          }}
        />
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
