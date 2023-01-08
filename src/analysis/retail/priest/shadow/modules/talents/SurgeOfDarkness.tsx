import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

// Example log: /report/JAPL1zpDfN7W8wck/33-Heroic+The+Council+of+Blood+-+Kill+(5:46)/Mayrim/standard/statistics
class SurgeOfDarkness extends Analyzer {
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
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_DARKNESS_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_DARKNESS_TALENT_BUFF),
      this.onBuffApplied,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_DARKNESS_TALENT_BUFF),
      this.onBuffApplied,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_DARKNESS_TALENT_BUFF),
      this.onBuffRemoved,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_DARKNESS_TALENT_BUFF),
      this.onBuffRemoved,
    );
  }

  onBuffApplied(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    this.procsGained += 1; // Add a proc to the counter
  }

  onBuffRemoved(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (
      this.eventHistory.last(
        1,
        100,
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.MIND_SPIKE_TALENT),
      ).length === 0
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
      actual: this.procsWasted,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 1.1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest) =>
      suggest(
        <>
          You wasted {this.procsWasted} out of {this.procsGained}{' '}
          <SpellLink id={SPELLS.SURGE_OF_DARKNESS_TALENT_BUFF.id} /> procs.
        </>,
      )
        .icon(TALENTS.SURGE_OF_DARKNESS_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.surgeofdarkness.efficiency',
            message: `You wasted ${this.procsWasted} out of ${this.procsGained} Surge of Darkness procs.`,
          }),
        )
        .recommended(`0 is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.SURGE_OF_DARKNESS_TALENT_BUFF.id}>
          <>
            {this.procsUsed}/{this.procsGained} <small>Procs Used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SurgeOfDarkness;
