import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

class Deathspeaker extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };
  protected eventHistory!: EventHistory;
  protected abilityTracker!: AbilityTracker;
  protected spellUsable!: SpellUsable;

  procsGained: number = 0;
  procsWasted: number = 0;
  lastProcTime: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEATHSPEAKER_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHSPEAKER_TALENT_BUFF),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHSPEAKER_TALENT_BUFF),
      this.onBuffRemoved,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHSPEAKER_TALENT_BUFF),
      this.onBuffRefresh,
    );
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this.procsGained += 1; // Add a proc to the counter
    if (this.spellUsable.isOnCooldown(TALENTS.SHADOW_WORD_DEATH_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS.SHADOW_WORD_DEATH_TALENT.id);
    }
    this.lastProcTime = event.timestamp;
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld >= 14990) {
      this.procsWasted += 1;
    }
  }

  onBuffRefresh() {
    this.procsWasted += 1;
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
          <SpellLink id={TALENTS.DEATHSPEAKER_TALENT.id} /> procs.{' '}
        </>,
      )
        .icon(TALENTS.DEATHSPEAKER_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.deathspeaker.efficiency',
            message: `You wasted ${this.procsWasted} out of ${this.procsGained} DeathSpeaker procs.`,
          }),
        )
        .recommended(`<0 is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.DEATHSPEAKER_TALENT_BUFF.id}>
          <>
            {this.getProcsUsed()}/{this.procsGained} <small>Procs Used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const goodDS = {
      count: this.getProcsUsed(),
      label: 'Deathspeaker procs used',
    };

    const badDS = {
      count: this.procsWasted,
      label: 'Deathspeaker procs wasted',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS.DEATHSPEAKER_TALENT.id} />
        </b>{' '}
        is gained randomly from <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> damage. <br />
        Cast <SpellLink id={TALENTS.SHADOW_WORD_DEATH_TALENT.id} /> while the buff is active to
        avoid wasting procs.
      </p>
    );

    const data = (
      <div>
        <strong>Death Speaker breakdown</strong>
        <GradiatedPerformanceBar good={goodDS} bad={badDS} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default Deathspeaker;
