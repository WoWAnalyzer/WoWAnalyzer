import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import EventHistory from 'parser/shared/modules/EventHistory';

const COMBUSTION_PRE_CASTS = [
  SPELLS.FIREBALL,
  TALENTS.PYROBLAST_TALENT,
  SPELLS.SCORCH,
  TALENTS.FLAMESTRIKE_TALENT,
];

class CombustionPreCastDelay extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  // prettier-ignore
  preCastDelay = () => {
    const combustCasts = this.eventHistory.getEvents(EventType.Cast, { searchBackwards: true, spell: TALENTS.COMBUSTION_TALENT });
    const combustionCasts: number[] = [];

    combustCasts.forEach(cast => {
      const preCastBegin = this.eventHistory.getEvents(EventType.BeginCast, { searchBackwards: true, spell: COMBUSTION_PRE_CASTS, count: 1, startTimestamp: cast.timestamp })[0]
      if (preCastBegin && preCastBegin.castEvent) {
        const castDelay = preCastBegin.castEvent.timestamp > cast.timestamp ? preCastBegin.castEvent.timestamp - cast.timestamp : 0
        combustionCasts[cast.timestamp] = castDelay
      }
    })
    return combustionCasts;
  }

  get totalDelay() {
    const casts = this.preCastDelay();

    let total = 0;
    casts.forEach((cast) => (total += cast));
    return total;
  }

  get combustionCastDelayThresholds() {
    return {
      actual:
        this.totalDelay /
        (this.eventHistory.getEvents(EventType.Cast, {
          searchBackwards: true,
          spell: TALENTS.COMBUSTION_TALENT,
        }).length || 0) /
        1000,
      isGreaterThan: {
        minor: 0.7,
        average: 1,
        major: 1.5,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  suggestions(when: When) {
    when(this.combustionCastDelayThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          On average, you used <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> with{' '}
          {formatNumber(actual)} seconds left on your pre-cast ability (The spell you were casting
          when you used <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />
          ). In order to maximize the number of casts you can get in during{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />, it is recommended that you are activating{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> closer to the end of your pre-cast
          (preferably within {recommended} seconds of the cast completing).
        </>,
      )
        .icon(TALENTS.COMBUSTION_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.combustion.castDelay">
            {formatNumber(actual)}s Avg. Pre-Cast Delay
          </Trans>,
        )
        .recommended(`${recommended} is recommended`),
    );
  }
}
export default CombustionPreCastDelay;
