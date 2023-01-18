import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';

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

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.MIND_DEVOURER_TALENT_BUFF),
      this.onBuffRefreshed,
    );
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this.abilities.increaseMaxCharges(event, SPELLS.MIND_BLAST.id, 1);
    this.spellUsable.endCooldown(SPELLS.MIND_BLAST.id, event.timestamp, false, true);

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

  onBuffRefreshed(event: RefreshBuffEvent) {
    this.procsGained += 1;
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
          <SpellLink id={SPELLS.SHADOWY_INSIGHT.id} /> procs.
        </>,
      )
        .icon(SPELLS.SHADOWY_INSIGHT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.shadowyInsight.efficiency',
            message: `You wasted ${this.procsWasted} out of ${this.procsGained} Shadowy Insight procs.`,
          }),
        )
        .recommended(`0 is recommended.`),
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

  get guideSubsection(): JSX.Element {
    const goodSI = {
      count: this.procsUsed,
      label: 'Shadowy Inisght procs used',
    };

    const badSI = {
      count: this.procsWasted,
      label: 'Shadowy Insight procs wasted',
    };

    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS.SHADOWY_INSIGHT_TALENT.id} />
        </b>{' '}
        is gained randomly from <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> damage. <br />
        Cast <SpellLink id={SPELLS.MIND_BLAST.id} /> while the buff is active to avoid wasting
        procs.
      </p>
    );

    const data = (
      <div>
        <strong>Shadowy Insight breakdown</strong>
        <GradiatedPerformanceBar good={goodSI} bad={badSI} />
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 50);
  }
}

export default ShadowyInsight;
