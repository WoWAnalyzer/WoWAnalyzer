import SPELLS from 'common/SPELLS/demonhunter';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, DamageEvent, RemoveDebuffEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { Uptime } from 'parser/ui/UptimeBar';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import HitBasedAnalyzer from 'analysis/retail/demonhunter/vengeance/guide/HitBasedAnalyzer';

interface TrackedHit {
  mitigated: boolean;
  event: DamageEvent;
}

export default class VoidReaver extends HitBasedAnalyzer {
  static dependencies = {
    ...HitBasedAnalyzer.dependencies,
    enemies: Enemies,
  };

  hits: TrackedHit[] = [];
  uptime: Uptime[] = [];

  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_REAVER_TALENT);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FRAILTY),
      this.onFrailtyApply,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.FRAILTY),
      this.onFrailtyRemove,
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

  private onFrailtyApply(event: ApplyDebuffEvent) {
    const uptime: Uptime = {
      start: event.timestamp,
      end: event.timestamp,
    };

    this.uptime.push(uptime);
  }

  private onFrailtyRemove(event: RemoveDebuffEvent) {
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

    const enemy = this.enemies.getSourceEntity(event);
    if (!enemy) {
      return;
    }

    const mitigated =
      enemy.hasBuff(SPELLS.FRAILTY.id) ||
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
