import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { TrackedHit } from 'interface/guide/components/DamageTakenPointChart';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import { Uptime } from 'parser/ui/UptimeBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export default class Shuffle extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  hits: TrackedHit[] = [];
  uptime: Uptime[] = [];

  get hitsWith() {
    return this.hits.filter(({ mitigated }) => mitigated).length;
  }

  get hitsWithout() {
    return this.hits.filter(({ mitigated }) => !mitigated).length;
  }

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._damageTaken);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SHUFFLE),
      this.onShuffleApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.SHUFFLE),
      this.onShuffleRemove,
    );
    this.addEventListener(Events.fightend, this.finalize);
  }

  private onShuffleApply(event: ApplyBuffEvent) {
    const uptime: Uptime = {
      start: event.timestamp,
      end: event.timestamp,
    };

    this.uptime.push(uptime);
  }

  private onShuffleRemove(event: RemoveBuffEvent) {
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

  private finalize() {
    const uptime = this.uptime[this.uptime.length - 1];
    if (!uptime || uptime.end !== uptime.start) {
      return;
    }

    uptime.end = this.owner.fight.end_time;
  }

  get uptimeSuggestionThreshold() {
    return {
      actual: this.hitsWith / this.hits.length,
      isLessThan: {
        minor: 0.98,
        average: 0.96,
        major: 0.94,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  private _damageTaken(event: DamageEvent) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }

    if (shouldIgnore(this.enemies, event)) {
      return;
    }

    const wasMitigated =
      this.selectedCombatant.hasBuff(SPELLS.SHUFFLE.id) ||
      (event.unmitigatedAmount === undefined && event.amount === 0);
    const mitigated = wasMitigated ? QualitativePerformance.Good : QualitativePerformance.Fail;

    this.hits.push({
      event,
      mitigated,
    });
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should maintain <SpellLink spell={SPELLS.SHUFFLE} /> while actively tanking.
        </>,
      )
        .icon(SPELLS.SHUFFLE.icon)
        .actual(`${formatPercentage(actual)}% of hits mitigated by Shuffle.`)
        .recommended(`at least ${formatPercentage(recommended)}% is recommended`),
    );
  }
}
