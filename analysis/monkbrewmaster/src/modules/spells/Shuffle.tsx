import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';

export type TrackedHit = {
  mitigated: boolean;
  event: DamageEvent;
};

export default class Shuffle extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  hits: TrackedHit[] = [];

  get hitsWith() {
    return this.hits.filter(({ mitigated }) => mitigated).length;
  }

  get hitsWithout() {
    return this.hits.filter(({ mitigated }) => !mitigated).length;
  }

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._damageTaken);
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

  _damageTaken(event: DamageEvent) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }

    if (shouldIgnore(this.enemies, event)) {
      return;
    }

    const mitigated = this.selectedCombatant.hasBuff(SPELLS.SHUFFLE.id);

    this.hits.push({
      event,
      mitigated,
    });
  }

  suggestions(when: When) {
    when(this.uptimeSuggestionThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should maintain <SpellLink id={SPELLS.SHUFFLE.id} /> while actively tanking.
        </>,
      )
        .icon(SPELLS.SHUFFLE.icon)
        .actual(`${formatPercentage(actual)}% of hits mitigated by Shuffle.`)
        .recommended(`at least ${formatPercentage(recommended)}% is recommended`),
    );
  }
}
