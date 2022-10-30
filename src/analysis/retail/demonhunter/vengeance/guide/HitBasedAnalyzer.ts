import Analyzer from 'parser/core/Analyzer';
import { Uptime } from 'parser/ui/UptimeBar';
import { TrackedHit } from 'analysis/retail/demonhunter/vengeance/modules/talents/FieryBrand';

export default abstract class HitBasedAnalyzer extends Analyzer {
  abstract hits: TrackedHit[];
  abstract uptime: Uptime[];

  abstract getHitsWith(): number;
  abstract getHitsWithout(): number;
}
