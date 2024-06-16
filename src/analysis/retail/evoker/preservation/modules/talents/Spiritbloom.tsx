import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { EmpowerEndEvent } from 'parser/core/Events';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT, GuideContainer } from '../../Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SPELLS from 'common/SPELLS/evoker';

interface CastInfo {
  timestamp: number;
  empowerment: number;
}

class Spiritbloom extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;
  casts: CastInfo[] = [];
  maxEmpowerLevel: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.SPIRITBLOOM_TALENT);

    if (!this.active) {
      return;
    }
    this.maxEmpowerLevel = this.selectedCombatant.hasTalent(
      TALENTS_EVOKER.FONT_OF_MAGIC_PRESERVATION_TALENT,
    )
      ? 4
      : 3;
    this.addEventListener(
      Events.empowerEnd
        .by(SELECTED_PLAYER)
        .spell([TALENTS_EVOKER.SPIRITBLOOM_TALENT, SPELLS.SPIRITBLOOM_FONT]),
      this.onEndEmpower,
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} />
        </b>{' '}
        is one of your empowered abilities and a very strong AoE triage heal. You should try to use
        this ability at maximum Empowerment level whenever it is not on cooldown.{' '}
        <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> is a strong candidate to consume{' '}
        <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />.
      </p>
    );

    const entries: BoxRowEntry[] = [];
    this.casts.forEach((cast) => {
      const value =
        cast.empowerment === this.maxEmpowerLevel
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail;
      const tooltip = (
        <>
          <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> @{' '}
          {this.owner.formatTimestamp(cast.timestamp)}
          <br /> Empowerment level: {cast.empowerment}
        </>
      );
      entries.push({ value, tooltip });
    });

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          <GuideContainer>
            <div style={{ marginLeft: '1em' }}>
              {this.avgEmpowerment.toFixed(1)}
              <small> avg empower lvl</small>
            </div>
            <PerformanceBoxRow values={entries} />
          </GuideContainer>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  get avgEmpowerment() {
    return (
      this.casts.reduce((prev, cur) => {
        return prev + cur.empowerment;
      }, 0) / this.casts.length
    );
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={
          this.selectedCombatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_PRESERVATION_TALENT)
            ? SPELLS.SPIRITBLOOM_FONT.id
            : TALENTS_EVOKER.SPIRITBLOOM_TALENT.id
        }
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        useThresholds
      />
    );
  }

  onEndEmpower(event: EmpowerEndEvent) {
    this.casts.push({ timestamp: event.timestamp, empowerment: event.empowermentLevel });
  }
}

export default Spiritbloom;
