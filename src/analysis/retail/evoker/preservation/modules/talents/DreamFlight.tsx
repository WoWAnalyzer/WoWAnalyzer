import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, HealEvent } from 'parser/core/Events';
import { formatPercentage } from 'common/format';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Combatants from 'parser/shared/modules/Combatants';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { PerformanceMark } from 'interface/guide';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { QualitativePerformance, getLowestPerf } from 'parser/ui/QualitativePerformance';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';

interface CastInfo {
  castTime: number;
  totalHit: number;
  overhealing: number;
  healing: number;
}

class DreamFlight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;
  numCasts: number = 0;
  numApply: number = 0;
  castInfo: CastInfo[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.DREAM_FLIGHT_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DREAM_FLIGHT_HEAL),
      this.onApply,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DREAM_FLIGHT_HEAL),
      this.onHeal,
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
    this.castInfo[this.castInfo.length - 1].totalHit = this.castInfo.at(-1)!.totalHit + 1;
  }

  onHeal(event: HealEvent) {
    const info = this.castInfo.at(-1)!;
    info.healing += event.amount;
    info.overhealing += event.overheal || 0;
  }

  onCast(event: CastEvent) {
    this.numCasts += 1;
    this.castInfo.push({ castTime: event.timestamp, totalHit: 0, overhealing: 0, healing: 0 });
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
          <SpellLink spell={TALENTS_EVOKER.DREAM_FLIGHT_TALENT} />
        </b>{' '}
        is a powerful healing CD that does an initial heal and leaves a powerful HoT on all targets
        hit. You should try to use it to cover high damage periods where your raid is clumped up in
        order to maximize its effectiveness. If used when your allies are spread out, it will do
        very little healing to the point where spread out fights make this talent unusable.
      </p>
    );
    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={TALENTS_EVOKER.DREAM_FLIGHT_TALENT} /> cast efficiency
          </strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          <br />
          {this.castInfo.map((info, idx) => {
            const header = (
              <>
                <SpellLink spell={TALENTS_EVOKER.DREAM_FLIGHT_TALENT} /> @{' '}
                {this.owner.formatTimestamp(info.castTime)}
              </>
            );
            const checklistItems: CooldownExpandableItem[] = [];
            let targetsHitPerf = QualitativePerformance.Good;
            let overhealingPerf = QualitativePerformance.Good;
            const percentHit = info.totalHit / this.combatants.playerCount;
            if (percentHit < 0.65) {
              targetsHitPerf = QualitativePerformance.Fail;
            } else if (percentHit < 0.75) {
              targetsHitPerf = QualitativePerformance.Ok;
            }
            checklistItems.push({
              label: (
                <>
                  # of targets hit <SpellLink spell={TALENTS_EVOKER.DREAM_FLIGHT_TALENT} />
                </>
              ),
              result: <PerformanceMark perf={targetsHitPerf} />,
              details: `${info.totalHit}/${this.combatants.playerCount} targets hit`,
            });
            const overhealPercent = info.overhealing / (info.overhealing + info.healing);
            if (overhealPercent > 0.5) {
              overhealingPerf = QualitativePerformance.Fail;
            } else if (overhealPercent > 0.4) {
              overhealingPerf = QualitativePerformance.Ok;
            }
            checklistItems.push({
              label: <>% overhealing</>,
              result: <PerformanceMark perf={overhealingPerf} />,
              details: <>{formatPercentage(overhealPercent)}%</>,
            });
            const lowestPerf = getLowestPerf([targetsHitPerf, overhealingPerf]);
            return (
              <CooldownExpandable
                header={header}
                checklistItems={checklistItems}
                perf={lowestPerf}
                key={idx}
              />
            );
          })}
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
}

export default DreamFlight;
