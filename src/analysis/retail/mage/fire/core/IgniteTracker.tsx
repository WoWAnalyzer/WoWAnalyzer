import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  ApplyDebuffEvent,
  RemoveDebuffEvent,
  RefreshDebuffEvent,
} from 'parser/core/Events';
import SPELLS from '../SPELLS';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';

interface IgniteWindow {
  start: number;
  end: number;
  totalDamage: number;
  ticks: number;
  targetID: number;
  targetInstance?: number;
  targetName: string;
}

interface IgniteDamageEvent {
  timestamp: number;
  amount: number;
  targetID: number;
  targetInstance?: number;
  targetName: string;
}

interface DpsSegment {
  start: number;
  end: number;
  dps: number;
}

interface TargetDpsData {
  targetName: string;
  targetID: number;
  targetInstance?: number;
  total: number;
  events: IgniteDamageEvent[];
}

const SAMPLE_INTERVAL = 1000; // Sample DPS every 1 second

/**
 * Tracks Ignite damage over time to provide data for heatmap and ribbon visualizations.
 */
export default class IgniteTracker extends Analyzer {
  static dependencies = {
    ...Analyzer.dependencies,
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  private igniteWindows = new Map<string, IgniteWindow>();
  private completedWindows: IgniteWindow[] = [];
  private damageEvents: IgniteDamageEvent[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.IGNITE),
      this.onApplyIgnite,
    );

    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.IGNITE),
      this.onRemoveIgnite,
    );

    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.IGNITE),
      this.onRefreshIgnite,
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.IGNITE), this.onDamage);
  }

  onApplyIgnite(event: ApplyDebuffEvent) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const target = this.enemies.getEntity(event);

    this.igniteWindows.set(targetString, {
      start: event.timestamp,
      end: event.timestamp,
      totalDamage: 0,
      ticks: 0,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
      targetName: target?.name || 'Unknown',
    });
  }

  onRemoveIgnite(event: RemoveDebuffEvent) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const window = this.igniteWindows.get(targetString);
    if (window) {
      window.end = event.timestamp;
      this.completedWindows.push(window);
      this.igniteWindows.delete(targetString);
    }
  }

  onRefreshIgnite(event: RefreshDebuffEvent) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const window = this.igniteWindows.get(targetString);
    if (window) {
      window.end = event.timestamp;
    }
  }

  onDamage(event: DamageEvent) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const window = this.igniteWindows.get(targetString);
    if (window) {
      const damage = event.amount + (event.absorbed || 0);
      window.totalDamage += damage;
      window.ticks += 1;
      window.end = event.timestamp;

      // Store the damage event
      const igniteEvent: IgniteDamageEvent = {
        timestamp: event.timestamp,
        amount: damage,
        targetID: event.targetID,
        targetInstance: event.targetInstance,
        targetName: window.targetName,
      };
      this.damageEvents.push(igniteEvent);
    }
  }

  /**
   * Gets DPS segments sampled at regular intervals for heatmap visualization
   */
  getDpsSegments(): DpsSegment[] {
    const allWindows = [...this.completedWindows, ...Array.from(this.igniteWindows.values())];

    if (allWindows.length === 0) {
      return [];
    }

    const fightStart = this.owner.fight.start_time;
    const fightEnd = this.owner.fight.end_time;
    const segments: DpsSegment[] = [];

    // Sample DPS at regular intervals
    for (let time = fightStart; time < fightEnd; time += SAMPLE_INTERVAL) {
      const segmentEnd = Math.min(time + SAMPLE_INTERVAL, fightEnd);
      let damage = 0;

      // Sum up damage from all active ignite windows in this time segment
      allWindows.forEach((window) => {
        const windowStart = window.start;
        const windowEnd = window.end;

        // Check if window overlaps with this segment
        if (windowStart < segmentEnd && windowEnd > time) {
          const overlapStart = Math.max(time, windowStart);
          const overlapEnd = Math.min(segmentEnd, windowEnd);
          const overlapDuration = overlapEnd - overlapStart;
          const windowDuration = windowEnd - windowStart;

          // Distribute damage proportionally
          if (windowDuration > 0) {
            damage += (window.totalDamage * overlapDuration) / windowDuration;
          }
        }
      });

      const dps = damage / (SAMPLE_INTERVAL / 1000);
      segments.push({
        start: time,
        end: segmentEnd,
        dps,
      });
    }

    return segments;
  }

  /**
   * Gets per-target damage events for heatmap visualization
   */
  getTargetDpsData(): TargetDpsData[] {
    // Group damage events by target
    const targetMap = new Map<string, IgniteDamageEvent[]>();

    this.damageEvents.forEach((event) => {
      const key = encodeTargetString(event.targetID, event.targetInstance);
      if (!targetMap.has(key)) {
        targetMap.set(key, []);
      }
      targetMap.get(key)!.push(event);
    });

    const result: TargetDpsData[] = [];

    targetMap.forEach((events, targetKey) => {
      const firstEvent = events[0];
      const total = events.reduce((sum, e) => sum + e.amount, 0);

      result.push({
        targetName: firstEvent.targetName,
        targetID: firstEvent.targetID,
        targetInstance: firstEvent.targetInstance,
        total,
        events,
      });
    });

    // Sort by total damage descending
    return result.sort((a, b) => b.total - a.total);
  }

  /**
   * Gets Ignite uptime percentage (0-1) across all targets
   */
  getUptimePercent(): number {
    return this.enemies.getBuffUptime(SPELLS.IGNITE.id) / this.owner.fightDuration;
  }

  /**
   * Gets time distribution across DPS tiers for ribbon visualization
   */
  getTimeDistribution() {
    const segments = this.getDpsSegments();

    if (segments.length === 0) {
      return [];
    }

    // Find max DPS to calculate dynamic thresholds
    const maxDps = Math.max(...segments.map((s) => s.dps));

    // Calculate dynamic thresholds based on max DPS
    const thresholds = [
      Math.floor(maxDps * 0.8), // Very High (80-100%)
      Math.floor(maxDps * 0.6), // High (60-80%)
      Math.floor(maxDps * 0.4), // Medium (40-60%)
      Math.floor(maxDps * 0.2), // Low (20-40%)
      0, // Very Low (0-20%)
    ];

    // Use the exact colors from IgniteVisualization.tsx
    const tiers = [
      {
        threshold: thresholds[0],
        label: `> ${Math.floor(thresholds[0] / 1000)}k DPS`,
        color: '#dc2626',
        duration: 0,
      }, // red
      {
        threshold: thresholds[1],
        label: `${Math.floor(thresholds[1] / 1000)}-${Math.floor(thresholds[0] / 1000)}k DPS`,
        color: '#ea580c',
        duration: 0,
      }, // orange
      {
        threshold: thresholds[2],
        label: `${Math.floor(thresholds[2] / 1000)}-${Math.floor(thresholds[1] / 1000)}k DPS`,
        color: '#f59e0b',
        duration: 0,
      }, // amber
      {
        threshold: thresholds[3],
        label: `${Math.floor(thresholds[3] / 1000)}-${Math.floor(thresholds[2] / 1000)}k DPS`,
        color: '#84cc16',
        duration: 0,
      }, // lime
      {
        threshold: 0,
        label: `< ${Math.floor(thresholds[3] / 1000)}k DPS`,
        color: '#6b7280',
        duration: 0,
      }, // gray
    ];

    segments.forEach((segment) => {
      const duration = segment.end - segment.start;

      // Find the appropriate tier
      for (const tier of tiers) {
        if (segment.dps >= tier.threshold) {
          tier.duration += duration;
          break;
        }
      }
    });

    return tiers.filter((tier) => tier.duration > 0);
  }

  get totalIgniteDamage() {
    const allWindows = [...this.completedWindows, ...Array.from(this.igniteWindows.values())];
    return allWindows.reduce((sum, window) => sum + window.totalDamage, 0);
  }

  get averageIgniteDps() {
    const fightDuration = this.owner.fightDuration;
    return fightDuration > 0 ? this.totalIgniteDamage / (fightDuration / 1000) : 0;
  }
}
