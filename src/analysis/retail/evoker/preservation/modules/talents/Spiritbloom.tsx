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
import { Fragment, type JSX } from 'react';

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
  maxEmpowerLevel = 0;

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
    let explanation;
    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.ENGULF_TALENT)) {
      explanation = (
        <div>
          <p>
            <b>
              <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} />
            </b>{' '}
            is one of your empowered abilities and a very strong AoE triage heal. You should try to
            use this ability whenever it is not on cooldown.{' '}
          </p>
          <p>
            As Flameshaper, <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> is a filler
            spell to do strong healing to few targets and shouldn't be prioritized when consuming{' '}
            <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
            es.
          </p>
          <p>You should always cast it at maximum empowerment level</p>
        </div>
      );
    } else {
      explanation = (
        <div>
          <p>
            <b>
              <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} />
            </b>{' '}
            is one of your empowered abilities and a very strong AoE triage heal. You should try to
            use this ability whenever it is not on cooldown.{' '}
          </p>
          <p>
            As Chronowarden, your best tool to do group healing is to spread{' '}
            <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} />
            es on your group, consume them with{' '}
            <SpellLink spell={TALENTS_EVOKER.VERDANT_EMBRACE_TALENT} /> to apply{' '}
            <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} />, apply another single{' '}
            <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> on yourself and then cast a{' '}
            <b>rank 2</b> <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> on yourself
          </p>
          <p>
            This maximizes the healing you do from{' '}
            <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> and{' '}
            <SpellLink spell={TALENTS_EVOKER.AFTERIMAGE_TALENT} /> to transfer via the{' '}
            <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} />.
          </p>
        </div>
      );
    }

    const entries: BoxRowEntry[] = [];
    this.casts.forEach((cast) => {
      let value = QualitativePerformance.Fail;
      const tooltip = [
        <Fragment key="1">
          <SpellLink spell={TALENTS_EVOKER.SPIRITBLOOM_TALENT} /> @{' '}
        </Fragment>,
        <Fragment key="2">{this.owner.formatTimestamp(cast.timestamp)}</Fragment>,
        <Fragment key="3">
          <br /> Empowerment level: {cast.empowerment}
        </Fragment>,
      ];

      if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.ENGULF_TALENT)) {
        if (cast.empowerment === this.maxEmpowerLevel) {
          value = QualitativePerformance.Good;
        }
      } else {
        const hasLifebind = this.selectedCombatant.getBuff(SPELLS.LIFEBIND_BUFF.id, cast.timestamp);
        if (hasLifebind) {
          tooltip.push(
            <Fragment key="4">
              <br />
              <SpellLink spell={TALENTS_EVOKER.LIFEBIND_TALENT} /> active
            </Fragment>,
          );
          const hasEcho = this.selectedCombatant.getBuff(
            TALENTS_EVOKER.ECHO_TALENT.id,
            cast.timestamp,
          );
          if (hasEcho) {
            tooltip.push(
              <Fragment key="5">
                <br />
                <SpellLink spell={TALENTS_EVOKER.ECHO_TALENT} /> on yourself
              </Fragment>,
            );
            if (cast.empowerment === 2) {
              value = QualitativePerformance.Perfect;
            } else if (cast.empowerment === 1) {
              value = QualitativePerformance.Good;
            } else if (cast.empowerment === this.maxEmpowerLevel) {
              value = QualitativePerformance.Ok;
            }
          } else if (cast.empowerment === this.maxEmpowerLevel) {
            value = QualitativePerformance.Good;
          }
        } else if (cast.empowerment === this.maxEmpowerLevel) {
          value = QualitativePerformance.Good;
        }
      }

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
        spell={
          this.selectedCombatant.hasTalent(TALENTS_EVOKER.FONT_OF_MAGIC_PRESERVATION_TALENT)
            ? SPELLS.SPIRITBLOOM_FONT
            : TALENTS_EVOKER.SPIRITBLOOM_TALENT
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
