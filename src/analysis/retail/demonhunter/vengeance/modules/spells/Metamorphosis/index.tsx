import HitBasedAnalyzer from 'analysis/retail/demonhunter/vengeance/guide/HitBasedAnalyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { Uptime } from 'parser/ui/UptimeBar';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/demonhunter';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import { TrackedHit } from 'analysis/retail/demonhunter/vengeance/modules/spells/DemonSpikes';

export default class Metamorphosis extends HitBasedAnalyzer {
  static dependencies = {
    ...HitBasedAnalyzer.dependencies,
    enemies: Enemies,
  };

  hits: TrackedHit[] = [];
  uptime: Uptime[] = [];

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.METAMORPHOSIS_TANK),
      this.onMetamorphosisApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.METAMORPHOSIS_TANK),
      this.onMetamorphosisRemove,
    );
    this.addEventListener(Events.fightend, this.finalize);
  }

  get suggestionThresholdsEfficiency(): NumberThreshold {
    return {
      actual: this.getHitsWith() / this.hits.length,
      isGreaterThan: {
        minor: 0.2,
        average: 0.3,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  getHitsWith() {
    return this.hits.filter(({ mitigated }) => mitigated).length;
  }

  getHitsWithout() {
    return this.hits.filter(({ mitigated }) => !mitigated).length;
  }

  private onMetamorphosisApply(event: ApplyBuffEvent) {
    const uptime: Uptime = {
      start: event.timestamp,
      end: event.timestamp,
    };

    this.uptime.push(uptime);
  }

  private onMetamorphosisRemove(event: RemoveBuffEvent) {
    let uptime = this.uptime[this.uptime.length - 1];
    if (!uptime) {
      uptime = {
        start: this.owner.fight.start_time,
        end: event.timestamp,
      };

      this.uptime.push(uptime);
    } else {
      uptime.end = event.timestamp;
    }
  }

  private onDamageTaken(event: DamageEvent) {
    if (shouldIgnore(this.enemies, event)) {
      return;
    }

    const mitigated =
      this.selectedCombatant.hasBuff(SPELLS.METAMORPHOSIS_TANK.id) ||
      (event.unmitigatedAmount === undefined && event.amount === 0);

    this.hits.push({
      event,
      mitigated,
    });
  }

  private finalize() {
    const uptime = this.uptime[this.uptime.length - 1];
    if (!uptime) {
      return;
    }
    if (uptime.end !== uptime.start) {
      return;
    }

    uptime.end = this.owner.fight.end_time;
  }
}
