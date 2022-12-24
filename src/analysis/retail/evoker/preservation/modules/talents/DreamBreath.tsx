import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { getBuffEvents } from '../../normalizers/CastLinkNormalizer';

class DreamBreath extends Analyzer {
  totalBreaths: number = 0;
  totalApplications: number = 0;
  processedEvents: Set<ApplyBuffEvent> = new Set<ApplyBuffEvent>();

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DREAM_BREATH),
      this.onApply,
    );
  }

  onApply(event: ApplyBuffEvent) {
    if (this.processedEvents.has(event)) {
      return;
    }
    const events = getBuffEvents(event);
    this.totalBreaths += 1;
    this.totalApplications += events.length;
    events.forEach((ev) => {
      this.processedEvents.add(ev);
    });
  }

  get averageTargetsHit() {
    return this.totalApplications / this.totalBreaths;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageTargetsHit,
      isLessThan: {
        minor: 5,
        average: 4,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to maximize the amount of targets hit by{' '}
          <SpellLink id={TALENTS_EVOKER.DREAM_BREATH_TALENT.id} />
        </>,
      )
        .icon(TALENTS_EVOKER.DREAM_BREATH_TALENT.icon)
        .actual(
          `${this.averageTargetsHit.toFixed(1)} ${t({
            id: 'evoker.preservation.suggestions.dreamBreath.avgTargetsHit',
            message: ` average targets hit`,
          })}`,
        )
        .recommended(`at least ${recommended} targets hit recommended`),
    );
  }
}

export default DreamBreath;
