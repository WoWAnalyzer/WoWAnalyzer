import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { RemoveBuffEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

class UntemperedDedication extends Analyzer {
  // a counter for when UD stacks are dropped
  totalDrops = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNTEMPERED_DEDICATION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.UNTEMPERED_DEDICATION_BUFF),
      this.onByPlayerUntemperedDedicationBuffRemoval,
    );
  }

  onByPlayerUntemperedDedicationBuffRemoval(event: RemoveBuffEvent) {
    this.totalDrops += 1;
  }

  get dropSuggestion() {
    return {
      actual: this.totalDrops,
      isGreaterThan: {
        minor: 2,
        average: 4,
        major: 6,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.dropSuggestion).addSuggestion((suggest, actual) =>
      suggest(
        <span>
          You dropped your <SpellLink id={TALENTS.UNTEMPERED_DEDICATION_TALENT} /> stacks {actual}{' '}
          times. Try to keep it up at all times, as this is a fairly large loss of healing. If the
          fight has a large amount of downtime forcing these drops, take this suggestion with a
          grain of salt.
        </span>,
      )
        .icon(TALENTS.UNTEMPERED_DEDICATION_TALENT.icon)
        .actual(<>You lost your stacks {actual} times</>)
        .recommended(<>It is recommended to maintain 5 stacks at all times.</>),
    );
  }
}

export default UntemperedDedication;
