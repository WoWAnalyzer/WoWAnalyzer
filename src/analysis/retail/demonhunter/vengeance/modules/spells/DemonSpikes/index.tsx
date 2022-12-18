import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import SCHOOLS from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { Uptime } from 'parser/ui/UptimeBar';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import HitBasedAnalyzer from 'analysis/retail/demonhunter/vengeance/guide/HitBasedAnalyzer';

export type TrackedHit = {
  mitigated: boolean;
  event: DamageEvent;
};

export default class DemonSpikes extends HitBasedAnalyzer {
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
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.DEMON_SPIKES_BUFF),
      this.onDemonSpikesApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.DEMON_SPIKES_BUFF),
      this.onDemonSpikesRemove,
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

  suggestions(when: When) {
    when(this.suggestionThresholdsEfficiency).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Cast <SpellLink id={SPELLS.DEMON_SPIKES.id} /> more regularly while actively tanking the
          boss or when they use a big physical attack. You missed having it up for{' '}
          {formatPercentage(1 - actual)}% of physical hits.
        </>,
      )
        .icon(SPELLS.DEMON_SPIKES.icon)
        .actual(
          t({
            id: 'demonhunter.vengeance.suggestions.demonSpikes.unmitgatedHits',
            message: `${formatPercentage(actual)}% unmitigated physical hits`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  private onDemonSpikesApply(event: ApplyBuffEvent) {
    const uptime: Uptime = {
      start: event.timestamp,
      end: event.timestamp,
    };

    this.uptime.push(uptime);
  }

  private onDemonSpikesRemove(event: RemoveBuffEvent) {
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
    // Demon's Spikes only adds armor
    if (event.ability.type !== SCHOOLS.ids.PHYSICAL) {
      return;
    }

    if (shouldIgnore(this.enemies, event)) {
      return;
    }

    const mitigated =
      this.selectedCombatant.hasBuff(SPELLS.DEMON_SPIKES_BUFF.id) ||
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
