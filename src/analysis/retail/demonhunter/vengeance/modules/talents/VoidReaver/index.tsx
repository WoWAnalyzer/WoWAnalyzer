import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, DamageEvent, RemoveDebuffEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { Uptime } from 'parser/ui/UptimeBar';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import HitBasedAnalyzer from 'analysis/retail/demonhunter/vengeance/guide/HitBasedAnalyzer';

export type TrackedHit = {
  mitigated: boolean;
  event: DamageEvent;
};

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

  getHitsWith() {
    return this.hits.filter(({ mitigated }) => mitigated).length;
  }

  getHitsWithout() {
    return this.hits.filter(({ mitigated }) => !mitigated).length;
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

  suggestions(when: When) {
    when(this.suggestionThresholdsEfficiency).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Cast <SpellLink id={TALENTS_DEMON_HUNTER.SIGIL_OF_FLAME_TALENT.id} /> /{' '}
          <SpellLink id={TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT} /> /{' '}
          <SpellLink id={SPELLS.SOUL_CLEAVE} /> more regularly while actively tanking the boss or
          when they use a big attack. You missed having Frailty up for{' '}
          {formatPercentage(1 - actual)}% of hits.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.VOID_REAVER_TALENT.icon)
        .actual(
          t({
            id: 'demonhunter.vengeance.suggestions.fieryBrand.unmitgatedHits',
            message: `${formatPercentage(actual)}% unmitigated hits`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
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

    uptime.end = this.owner.fight.end_time;
  }
}
