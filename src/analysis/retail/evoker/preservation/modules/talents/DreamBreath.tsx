import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, EmpowerEndEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { getBuffEvents } from '../../normalizers/EventLinking/helpers';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT, GuideContainer } from '../../Guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

interface CastInfo {
  timestamp: number;
  coyActive: boolean;
  targetsHit: number;
  counted: boolean;
}

class DreamBreath extends Analyzer {
  totalBreaths: number = 0;
  totalApplications: number = 0;
  processedEvents: Set<ApplyBuffEvent> = new Set<ApplyBuffEvent>();
  casts: CastInfo[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.DREAM_BREATH, SPELLS.DREAM_BREATH_FONT]),
      this.onApply,
    );
    // an empowerend will not be generated if using tip the scales
    this.addEventListener(
      Events.empowerEnd
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.DREAM_BREATH_TALENT, SPELLS.DREAM_BREATH_FONT]),
      this.onCast,
    );
  }

  onCast(event: EmpowerEndEvent) {
    this.totalBreaths += 1;
    const info = {
      timestamp: event.timestamp,
      coyActive: this.selectedCombatant.hasBuff(SPELLS.CALL_OF_YSERA_BUFF.id),
      targetsHit: 0,
      counted: false,
    };
    this.casts.push(info);
  }

  onApply(event: ApplyBuffEvent) {
    if (this.processedEvents.has(event)) {
      return;
    }
    const events = getBuffEvents(event);
    const info = this.casts.at(-1)!;
    events.forEach((ev) => {
      this.processedEvents.add(ev);
      // make sure its not a stasis DB
      if (info && !info.counted) {
        this.casts.at(-1)!.targetsHit += 1;
      }
    });
    if (info) {
      info.counted = true;
    }
  }

  get averageTargetsHit() {
    return (
      this.casts.reduce((prev, cur) => {
        return prev + cur.targetsHit;
      }, 0) / this.casts.length
    );
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
          <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} />
        </b>{' '}
        is one of your empowered abilities and a very strong HoT. You should aim to use it at
        Empower 1 in most scenarios, with the rare exception when you desperately need a burst AoE
        heal. If talented into <SpellLink spell={TALENTS_EVOKER.CALL_OF_YSERA_TALENT} />, always use{' '}
        <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> prior to casting{' '}
        <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} />.
      </p>
    );

    const entries: BoxRowEntry[] = [];
    this.casts.forEach((cast) => {
      let value = QualitativePerformance.Fail;
      const coyActive =
        this.selectedCombatant.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT) && cast.coyActive;
      if (coyActive && cast.targetsHit === 5) {
        value = QualitativePerformance.Good;
      } else if (coyActive && cast.targetsHit === 4) {
        value = QualitativePerformance.Ok;
      }
      const tooltip = (
        <>
          <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> @{' '}
          {this.owner.formatTimestamp(cast.timestamp)} <br />
          {cast.targetsHit} targets hit <br />
          {this.selectedCombatant.hasTalent(TALENTS_EVOKER.CALL_OF_YSERA_TALENT) && (
            <>
              <SpellLink spell={TALENTS_EVOKER.CALL_OF_YSERA_TALENT} /> active:{' '}
              {cast.coyActive ? 'Yes' : 'No'}
            </>
          )}
        </>
      );
      entries.push({ value, tooltip });
    });

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          <GuideContainer>
            <div style={{ marginLeft: '1em' }}>
              {this.averageTargetsHit.toFixed(1)}
              <small> avg targets hit</small>
            </div>
            <PerformanceBoxRow values={entries} />
          </GuideContainer>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={
          this.selectedCombatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_PRESERVATION_TALENT)
            ? SPELLS.DREAM_BREATH_FONT.id
            : TALENTS_EVOKER.DREAM_BREATH_TALENT.id
        }
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default DreamBreath;
