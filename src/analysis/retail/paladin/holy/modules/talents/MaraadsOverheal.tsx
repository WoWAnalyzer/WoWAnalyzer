import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const OVERHEAL_THRESHOLD = 0.5;

class MaraadsOverheal extends Analyzer {
  totalCasts = 0;
  castsOverhealed = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MARAADS_DYING_BREATH_TALENT);
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
  }

  cast(event: CastEvent) {
    this.totalCasts += 1;
  }

  heal(event: HealEvent) {
    const totalHeal = event.amount + (event.overheal || 0) + (event.absorbed || 0);
    const effectiveHeal = event.amount + (event.absorbed || 0); // effective healing by default does not include healing done to healing absorbs, even though that is effective healing
    if (event.hitType === HIT_TYPES.CRIT) {
      // dont  want to penalize somebody for accidentally critting somebody for more than their entire healthbar
      return;
    }
    if (effectiveHeal / totalHeal < OVERHEAL_THRESHOLD) {
      this.castsOverhealed += 1;
    }
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
          Try to avoid casting <SpellLink id={TALENTS.MARAADS_DYING_BREATH_TALENT.id} /> buffed
          <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> when a large portion of it would
          overheal. If you are finding that this is happening very frequently, consider using a
          different legendary.
        </>,
      )
        .icon(TALENTS.MARAADS_DYING_BREATH_TALENT.icon)
        .actual(`${formatPercentage(actual)}% of your casts overhealed by more than 50%`)
        .recommended(`< ${formatPercentage(recommended)}% is recommended`),
    );
  }
}
export default MaraadsOverheal;
