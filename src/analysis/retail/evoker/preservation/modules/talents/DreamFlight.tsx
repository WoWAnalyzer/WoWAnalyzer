import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import { formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Combatants from 'parser/shared/modules/Combatants';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

interface CastInfo {
  castTime: number;
  totalHit: number;
}

class DreamFlight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  numCasts: number = 0;
  numApply: number = 0;
  appliesByCast: CastInfo[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.DREAM_FLIGHT_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DREAM_FLIGHT_HEAL),
      this.onApply,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.DREAM_FLIGHT_TALENT),
      this.onCast,
    );
  }

  onApply(event: ApplyBuffEvent) {
    if (!this.combatants.getEntity(event)) {
      return;
    }
    this.numApply += 1;
    this.appliesByCast[this.appliesByCast.length - 1].totalHit =
      this.appliesByCast.at(-1)!.totalHit + 1;
  }

  onCast(event: CastEvent) {
    this.numCasts += 1;
    this.appliesByCast.push({ castTime: event.timestamp, totalHit: 0 });
  }

  get percentOfGroupHit() {
    if (!this.numCasts) {
      return 0;
    }
    const averageHit = this.numApply / this.numCasts;
    return averageHit / Object.keys(this.combatants.getEntities()).length;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentOfGroupHit,
      isLessThan: {
        major: 0.5,
        average: 0.6,
        minor: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_EVOKER.DREAM_FLIGHT_TALENT.id} />
        </b>{' '}
        is a powerful healing CD that does an initial heal and leaves a powerful HoT on all targets
        hit. You should try to use it to cover high damage periods where your raid is clumped up in
        order to maximize its effectiveness. If used when your allies are spread out, it will do
        very little healing to the point where spread out fights make this talent unusable.
      </p>
    );
    const entries: BoxRowEntry[] = [];
    const totalPlayers = this.combatants.playerCount;
    this.appliesByCast.forEach((info) => {
      const percent = info.totalHit / totalPlayers;
      let value = QualitativePerformance.Fail;
      if (percent > 0.85) {
        value = QualitativePerformance.Good;
      } else if (percent > 0.7) {
        value = QualitativePerformance.Ok;
      }
      const tooltip = (
        <>
          <SpellLink spell={TALENTS_EVOKER.DREAM_FLIGHT_TALENT} /> @{' '}
          {this.owner.formatTimestamp(info.castTime)}
          <br /> Targets hit: {info.totalHit}
        </>
      );
      entries.push({ value, tooltip });
    });

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink id={TALENTS_EVOKER.DREAM_FLIGHT_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          <PerformanceBoxRow values={entries} />
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS_EVOKER.DREAM_FLIGHT_TALENT.id}
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
          Your <SpellLink id={TALENTS_EVOKER.DREAM_FLIGHT_TALENT.id} /> is not hitting enough
          targets.
        </>,
      )
        .icon(TALENTS_EVOKER.DREAM_FLIGHT_TALENT.icon)
        .actual(
          `${formatPercentage(this.percentOfGroupHit, 2)}${t({
            id: 'evoker.preservation.suggestions.dreamFlight.targetsHit',
            message: `% of group hit with Dream Flight`,
          })}`,
        )
        .recommended(`${recommended * 100}% or more is recommended`),
    );
  }
}

export default DreamFlight;
