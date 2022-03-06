import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const OVERHEAL_THRESHOLD = 0.5;

class MaraadsAnalysis extends Analyzer {
  totalCasts = 0;
  overheal = 0;
  castsOverhealed = 0;
  LODcasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.MARAADS_DYING_BREATH.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.spell(SPELLS.LIGHT_OF_THE_MARTYR).by(SELECTED_PLAYER),
      this.cast,
    );
    this.addEventListener(
      Events.heal.spell(SPELLS.LIGHT_OF_THE_MARTYR).by(SELECTED_PLAYER),
      this.heal,
    );
    this.addEventListener(
      Events.cast.spell(SPELLS.LIGHT_OF_DAWN_CAST).by(SELECTED_PLAYER),
      this.LODcast,
    );
  }

  cast(event: CastEvent) {
    this.totalCasts += 1;
  }

  LODcast(event: CastEvent) {
    this.LODcasts += 1;
  }

  private heal(event: HealEvent) {
    const totalHeal = event.amount + (event.overheal || 0) + (event.absorbed || 0);
    const effectiveHeal = event.amount + (event.absorbed || 0);
    if (event.hitType !== HIT_TYPES.CRIT && effectiveHeal / totalHeal < OVERHEAL_THRESHOLD) {
      this.castsOverhealed += 1;
    }
  }

  get unbuffedCastsSuggestion() {
    return {
      actual: 1 - this.LODcasts / this.totalCasts,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get notEnoughCastsSuggestion() {
    return {
      actual: 1 - this.totalCasts / this.LODcasts,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get overhealSuggestion() {
    return {
      actual: this.castsOverhealed / this.totalCasts,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  suggestions(when: When) {
    when(this.overhealSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to avoid casting <SpellLink id={SPELLS.MARAADS_DYING_BREATH.id} /> buffed
          <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> when a large portion of it would
          overheal. If you are finding that this is happening very frequently, consider using a
          different legendary.
        </>,
      )
        .icon(SPELLS.MARAADS_DYING_BREATH.icon)
        .actual(`${formatPercentage(actual)}% of your casts overhealed by more than 50%`)
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );
    when(this.unbuffedCastsSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to avoid casting unbuffed <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />, as it is a
          very inefficient spell when it isn't buffed by{' '}
          <SpellLink id={SPELLS.MARAADS_DYING_BREATH.id} />.
        </>,
      )
        .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
        .actual(`${formatPercentage(actual)}% of your casts were unbuffed by Maraad's Dying Breath`)
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );
    when(this.notEnoughCastsSuggestion).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to keep your casts of <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> at a 1:1 ratio
          with your casts of <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />, as you are wasting a
          large amount of healing by overwriting the{' '}
          <SpellLink id={SPELLS.MARAADS_DYING_BREATH.id} /> proc. If you are frequently unable to
          find a suitable target for your buffed <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />,
          consider using a different legendary.
        </>,
      )
        .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
        .actual(
          `You had ${formatPercentage(
            actual,
          )}% more casts of Light of Dawn than Light of the Martyr`,
        )
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );
  }
}
export default MaraadsAnalysis;
