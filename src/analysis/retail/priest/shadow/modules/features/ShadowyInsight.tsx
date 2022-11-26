import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

// Example log: /report/JAPL1zpDfN7W8wck/33-Heroic+The+Council+of+Blood+-+Kill+(5:46)/Mayrim/standard/statistics
class ShadowyInsight extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    eventHistory: EventHistory,
    spellUsable: SpellUsable,
  };
  protected abilities!: Abilities;
  protected eventHistory!: EventHistory;
  protected spellUsable!: SpellUsable;

  procsGained = 0;
  procsUsed = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_INSIGHT_BUFF),
      this.onBuffApplied,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_INSIGHT_BUFF),
      this.onBuffRemoved,
    );
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this.abilities.increaseMaxCharges(event, SPELLS.MIND_BLAST.id, 1);

    this.procsGained += 1; // Add a proc to the counter
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    this.abilities.decreaseMaxCharges(event, SPELLS.MIND_BLAST.id, 1);

    if (
      this.eventHistory.last(1, 100, Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST))
        .length === 0
    ) {
      // If MB is not instant, it's not a proc
      return;
    }

    this.procsUsed += 1;
  }

  get procsWasted() {
    return this.procsGained - this.procsUsed;
  }

  get suggestionThresholds() {
    return {
      actual: this.procsWasted / this.procsGained,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You wasted {this.procsWasted} out of {this.procsGained}{' '}
          <SpellLink id={SPELLS.SHADOWY_INSIGHT.id} /> procs.
        </>,
      )
        .icon(SPELLS.SHADOWY_INSIGHT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.darkThoughts.efficiency',
            message: `You wasted ${this.procsWasted} out of ${this.procsGained} Shadowy Insight procs.`,
          }),
        )
        .recommended(`${recommended} is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.GENERAL} size="flexible">
        <BoringSpellValueText spellId={SPELLS.SHADOWY_INSIGHT.id}>
          <>
            {this.procsUsed}/{this.procsGained} <small>Procs Used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ShadowyInsight;
