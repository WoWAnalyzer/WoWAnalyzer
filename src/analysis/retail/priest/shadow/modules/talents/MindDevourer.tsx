import { defineMessage } from '@lingui/macro';
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

const BUFF_DURATION_MS = 15000;

class MindDevourer extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
  };
  protected eventHistory!: EventHistory;
  protected abilityTracker!: AbilityTracker;

  procsGained: number = 0; //Total gained Procs
  procsExpired: number = 0; //procs lost to time
  procsOver: number = 0; //procs lost to refresh
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

  get procsWasted() {
    return this.procsExpired + this.procsOver;
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this.procsGained += 1;
    this.lastProcTime = event.timestamp;
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld >= BUFF_DURATION_MS - 10) {
      this.procsExpired += 1;
    }
  }

  onBuffRefreshed(event: RefreshBuffEvent) {
    this.procsGained += 1;
    this.procsOver += 1;
    this.lastProcTime = event.timestamp;
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
          <SpellLink spell={TALENTS.MIND_DEVOURER_TALENT} /> procs.{' '}
        </>,
      )
        .icon(TALENTS.MIND_DEVOURER_TALENT.icon)
        .actual(
          defineMessage({
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
        <BoringSpellValueText spell={TALENTS.MIND_DEVOURER_TALENT}>
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

    const expiredMD = {
      count: this.procsExpired,
      label: 'Mind Devourer procs Expired',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.MIND_DEVOURER_TALENT} />
        </b>{' '}
        is gained randomly from <SpellLink spell={SPELLS.MIND_BLAST} /> casts.
        <br />
        Before the buff expires, cast <SpellLink spell={TALENTS.DEVOURING_PLAGUE_TALENT} />. While
        you have this active, be careful using <SpellLink spell={SPELLS.MIND_BLAST} />, as it may
        overwrite it.
      </p>
    );

    const data = (
      <div>
        <strong>Mind Devourer breakdown</strong>
        <GradiatedPerformanceBar good={goodMD} ok={overMD} bad={expiredMD} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default MindDevourer;
