import Analyzer from 'parser/core/Analyzer';
import { Uptime } from 'parser/ui/UptimeBar';
import { DamageEvent } from 'parser/core/Events';

export type TrackedHit = {
  mitigated: boolean;
  event: DamageEvent;
};

export default abstract class HitBasedAnalyzer extends Analyzer {
  abstract hits: TrackedHit[];
  abstract uptime: Uptime[];

  abstract getHitsWith(): number;

  abstract getHitsWithout(): number;
}
