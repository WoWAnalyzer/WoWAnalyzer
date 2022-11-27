import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

// Example Log https://www.warcraftlogs.com/reports/ctvYK32ZhbDqLmX8#fight=30&type=damage-done

class UnfurlingDarkness extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
  };
  protected eventHistory!: EventHistory;
  protected abilityTracker!: AbilityTracker;

  procsGained: number = 0;
  procsWasted: number = 0;
  lastProcTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNFURLING_DARKNESS_TALENT.id);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.UNFURLING_DARKNESS_BUFF),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.UNFURLING_DARKNESS_BUFF),
      this.onBuffRemoved,
    );
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this.procsGained += 1; // Add a proc to the counter
    this.lastProcTime = event.timestamp;
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld >= 7990) {
      this.procsWasted += 1;
    }
  }

  getProcsUsed() {
    return this.procsGained - this.procsWasted;
  }

  get suggestionThresholds() {
    return {
      actual: this.procsWasted / this.procsGained,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0.05,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You wasted {formatPercentage(actual)}% of{' '}
          <SpellLink id={TALENTS.UNFURLING_DARKNESS_TALENT.id} /> procs.{' '}
        </>,
      )
        .icon(TALENTS.UNFURLING_DARKNESS_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.unfurlingDarkness.efficiency',
            message: `Wasted ${formatPercentage(
              actual,
            )}% of Unfurling Darkness procs. If you're not getting enough uses from Unfurling Darkness, you'll likely benefit more from using a different talent.`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.UNFURLING_DARKNESS_BUFF.id}>
          <>
            {this.getProcsUsed()}/{this.procsGained} <small>Procs Used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default UnfurlingDarkness;
