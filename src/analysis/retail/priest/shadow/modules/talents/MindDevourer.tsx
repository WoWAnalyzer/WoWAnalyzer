import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

// Example Log https://www.warcraftlogs.com/reports/ctvYK32ZhbDqLmX8#fight=30&type=damage-done

class MindDevourer extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
  };
  protected eventHistory!: EventHistory;
  protected abilityTracker!: AbilityTracker;

  procsGained: number = 0;
  procsWasted: number = 0;
  procsOver: number = 0;
  lastProcTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MIND_DEVOURER_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_DEVOURER_TALENT_BUFF),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_DEVOURER_TALENT_BUFF),
      this.onBuffRemoved,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_DEVOURER_TALENT_BUFF),
      this.onBuffRefreshed,
    );
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this.procsGained += 1; // Add a proc to the counter
    this.lastProcTime = event.timestamp;
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld >= 14990) {
      this.procsWasted += 1;
    }
  }

  onBuffRefreshed(event: RefreshBuffEvent) {
    this.procsOver += 1;
  }

  getProcsUsed() {
    return this.procsGained - this.procsWasted - this.procsOver;
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
          <SpellLink id={TALENTS.MIND_DEVOURER_TALENT.id} /> procs.{' '}
        </>,
      )
        .icon(TALENTS.MIND_DEVOURER_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.mindDevourer.efficiency',
            message: `You wasted ${this.procsWasted} out of ${this.procsGained} of Mind Devourer procs.`,
          }),
        )
        .recommended(`0 is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={TALENTS.MIND_DEVOURER_TALENT.id}>
          <>
            {this.getProcsUsed()}/{this.procsGained} <small>Procs Used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const goodMD = {
      count: this.getProcsUsed(),
      label: 'Mind Devourer procs Used',
    };

    const overMD = {
      count: this.procsOver,
      label: 'Mind Devourer procs Overwritten',
    };

    const wastedMD = {
      count: this.procsWasted,
      label: 'Mind Devourer procs Expired',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS.MIND_DEVOURER_TALENT.id} />
        </b>{' '}
        is gained randomly from <SpellLink id={SPELLS.MIND_BLAST.id} /> casts.
        <br />
        Before the buff expires, cast <SpellLink id={SPELLS.DEVOURING_PLAGUE.id} /> or fully channel{' '}
        <SpellLink id={TALENTS.MIND_SEAR_TALENT.id} /> on two or more targets. While you have this
        active, be careful using <SpellLink id={SPELLS.MIND_BLAST.id} />, as it may overwrite it.
      </p>
    );

    const data = (
      <div>
        <strong>Mind Devourer breakdown</strong>
        <GradiatedPerformanceBar good={goodMD} ok={overMD} bad={wastedMD} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default MindDevourer;
