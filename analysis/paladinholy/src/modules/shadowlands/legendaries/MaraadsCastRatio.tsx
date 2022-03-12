import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class MaraadsCastRatio extends Analyzer {
  LOTMCasts = 0;
  LODcasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.MARAADS_DYING_BREATH.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.spell(SPELLS.LIGHT_OF_THE_MARTYR).by(SELECTED_PLAYER),
      this.LOTMcast,
    );
    this.addEventListener(
      Events.cast.spell(SPELLS.LIGHT_OF_DAWN_CAST).by(SELECTED_PLAYER),
      this.LODcast,
    );
  }

  LOTMcast(event: CastEvent) {
    this.LOTMCasts += 1;
  }

  LODcast(event: CastEvent) {
    this.LODcasts += 1;
  }

  get unbuffedLOTMSuggestion() {
    // should only ever show when you have more LOTM than LOD, as having more LOD would give you a negative number when subtracted from 1
    return {
      actual: 1 - this.LODcasts / this.LOTMCasts,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get notEnoughLOTMSuggestion() {
    // should only ever show when you have more LOD than LOTM, as having more LOTM would give you a negative number when subtracted from 1
    return {
      actual: 1 - this.LOTMCasts / this.LODcasts,
      isGreaterThan: {
        minor: 0.1,
        average: 0.175,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  suggestions(when: When) {
    // (should) only ever display the notEnoughCastsSuggestion or the unbuffedCastsSuggestion, never both
    when(this.unbuffedLOTMSuggestion).addSuggestion((suggest, actual, recommended) =>
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
    when(this.notEnoughLOTMSuggestion).addSuggestion((suggest, actual, recommended) =>
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
export default MaraadsCastRatio;
