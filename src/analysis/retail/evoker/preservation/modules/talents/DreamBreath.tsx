import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { getBuffEvents } from '../../normalizers/CastLinkNormalizer';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';

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

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_EVOKER.DREAM_BREATH_TALENT.id} />
        </b>{' '}
        is one of your empowered abilities and a very strong HoT. You should aim to use it at
        Empower 1 in most scenarios, with the rare exception when you desperately need a burst AoE
        heal. If talented into <SpellLink id={TALENTS_EVOKER.CALL_OF_YSERA_TALENT.id} />, always use{' '}
        <SpellLink id={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> prior to casting{' '}
        <SpellLink id={TALENTS_EVOKER.DREAM_BREATH_TALENT.id} />.
      </p>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_EVOKER.DREAM_BREATH_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
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
