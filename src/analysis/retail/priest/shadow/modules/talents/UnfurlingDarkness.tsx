import { defineMessage } from '@lingui/macro';
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

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

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
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNFURLING_DARKNESS_TALENT);
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
          <SpellLink spell={TALENTS.UNFURLING_DARKNESS_TALENT} /> procs.{' '}
        </>,
      )
        .icon(SPELLS.UNFURLING_DARKNESS_BUFF.icon)
        .actual(
          defineMessage({
            id: 'priest.shadow.suggestions.unfurlingDarkness.efficiency',
            message: `You wasted ${this.procsWasted} out of ${this.procsGained} Unfurling Darkness procs.`,
          }),
        )
        .recommended(`0 is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={SPELLS.UNFURLING_DARKNESS_BUFF}>
          <>
            {this.getProcsUsed()}/{this.procsGained} <small>Procs Used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const goodUD = {
      count: this.getProcsUsed(),
      label: 'Unfurling Darkness procs used',
    };

    const badUD = {
      count: this.procsWasted,
      label: 'Unfurling Darkness procs wasted',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.UNFURLING_DARKNESS_TALENT} />
        </b>{' '}
        is gained by casting <SpellLink spell={SPELLS.VAMPIRIC_TOUCH} />.<br />
        Cast <SpellLink spell={SPELLS.VAMPIRIC_TOUCH} /> while the buff is active to avoid wasting
        procs.
      </p>
    );

    const data = (
      <div>
        <strong>Unfurling Darkness breakdown</strong>
        <GradiatedPerformanceBar good={goodUD} bad={badUD} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default UnfurlingDarkness;
