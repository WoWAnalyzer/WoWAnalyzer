import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  EmpowerEndEvent,
  CastEvent,
  GetRelatedEvents,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { isFromTipTheScales } from '../../normalizers/EventLinking/helpers';
import { DREAM_BREATH_CAST } from '../../normalizers/EventLinking/constants';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { GUIDE_CORE_EXPLANATION_PERCENT, GuideContainer } from '../../Guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Combatants from 'parser/shared/modules/Combatants';

interface CastInfo {
  timestamp: number;
  targetsHit: number;
  counted: boolean;
}

class DreamBreath extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  totalBreaths = 0;
  totalApplications = 0;
  processedEvents: Set<ApplyBuffEvent | RefreshBuffEvent> = new Set<
    ApplyBuffEvent | RefreshBuffEvent
  >();
  casts: Map<number, CastInfo> = new Map<number, CastInfo>();

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.empowerEnd
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.DREAM_BREATH_TALENT, SPELLS.DREAM_BREATH_FONT]),
      this.onEmpowerEnd,
    );
    // an empowerend will not be generated if using tip the scales
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.DREAM_BREATH_TALENT, SPELLS.DREAM_BREATH_FONT]),
      this.onCast,
    );
  }

  onEmpowerEnd(event: EmpowerEndEvent) {
    const buffApplications = GetRelatedEvents<ApplyBuffEvent | RefreshBuffEvent>(
      event,
      DREAM_BREATH_CAST,
    );
    this.totalBreaths += 1;
    const info = {
      timestamp: event.timestamp,
      targetsHit: this.getTargetCount(buffApplications),
      counted: false,
    };
    this.casts.set(event.timestamp, info);
  }

  onCast(event: CastEvent) {
    if (isFromTipTheScales(event)) {
      const buffApplications = GetRelatedEvents<ApplyBuffEvent | RefreshBuffEvent>(
        event,
        DREAM_BREATH_CAST,
      );
      this.totalBreaths += 1;
      const info = {
        timestamp: event.timestamp,
        targetsHit: this.getTargetCount(buffApplications),
        counted: false,
      };
      this.casts.set(event.timestamp, info);
    }
  }

  getTargetCount(buffApplications: (ApplyBuffEvent | RefreshBuffEvent)[]) {
    let targetsHit = 0;
    buffApplications.forEach((buff) => {
      if (!this.processedEvents.has(buff) && buff.ability.guid !== SPELLS.DREAM_BREATH_ECHO.id) {
        const target = this.combatants.getEntity(buff);
        if (target !== null) {
          targetsHit += 1;
        }
      }
    });
    return targetsHit;
  }

  get averageTargetsHit() {
    if (this.casts.size === 0) return 0;
    let sum = 0;
    this.casts.forEach((cast) => {
      sum += cast.targetsHit;
    });
    return sum / this.casts.size;
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
        is your empowered healing ability and a very strong part of your kit. You should aim to use
        it at Empower rank 1 in most scenarios, with the rare exception when you desperately need a
        burst AoE heal.
      </p>
    );

    const entries: BoxRowEntry[] = [];
    this.casts.forEach((cast) => {
      let value = QualitativePerformance.Fail;
      const groupSize = Object.keys(this.combatants.getEntities()).length;
      const maxTargets = groupSize > 5 ? 6 : 5;
      if (cast.targetsHit >= maxTargets) {
        value = QualitativePerformance.Good;
      } else if (cast.targetsHit >= maxTargets - 1) {
        value = QualitativePerformance.Ok;
      }
      const tooltip = (
        <>
          <div>
            <SpellLink spell={TALENTS_EVOKER.DREAM_BREATH_TALENT} /> @{' '}
            {this.owner.formatTimestamp(cast.timestamp)}
          </div>
          <div>{cast.targetsHit} targets hit</div>
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
        spell={
          this.selectedCombatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_PRESERVATION_TALENT)
            ? SPELLS.DREAM_BREATH_FONT
            : TALENTS_EVOKER.DREAM_BREATH_TALENT
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
