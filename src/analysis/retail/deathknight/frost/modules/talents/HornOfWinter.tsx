import talents from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

interface HornCast {
  timestamp: number;
  wastedRp: number;
  wastedRunes: number;
  gainedRp: number;
  gainedRunes: number;
}

export default class HornOfWinter extends Analyzer {
  howTracker: HornCast[] = [];

  currentTimestamp = 0;
  wastedRp = 0;
  wastedRunes = 0;
  gainedRunes = 0;
  gainedRp = 0;

  constructor(options: Options) {
    super(options);

    this.currentTimestamp = 0;

    this.active = this.selectedCombatant.hasTalent(talents.HORN_OF_WINTER_TALENT);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(talents.HORN_OF_WINTER_TALENT),
      this.onResourceGain,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.HORN_OF_WINTER_TALENT),
      this.onCast,
    );
  }

  onResourceGain(event: ResourceChangeEvent) {
    if (event.resourceChangeType === RESOURCE_TYPES.RUNES.id) {
      this.gainedRunes = event.resourceChange - event.waste;
      this.wastedRunes = event.waste;
    } else if (event.resourceChangeType === RESOURCE_TYPES.RUNIC_POWER.id) {
      this.gainedRp = event.resourceChange - event.waste;
      this.wastedRp = event.waste;
    }
  }

  onCast(event: CastEvent) {
    this.howTracker.push({
      timestamp: event.timestamp,
      wastedRp: this.wastedRp,
      wastedRunes: this.wastedRunes,
      gainedRunes: this.gainedRunes,
      gainedRp: this.gainedRp,
    });
    this.wastedRp = 0;
    this.wastedRunes = 0;
    this.gainedRp = 0;
    this.gainedRunes = 0;
  }

  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink id={talents.HORN_OF_WINTER_TALENT.id} />
        </strong>{' '}
        is a strong resource cooldown used primarily to extend{' '}
        <SpellLink id={talents.BREATH_OF_SINDRAGOSA_TALENT.id} />. It is best used when the Runic
        Power will not go to waste and you are unable to press{' '}
        <SpellLink id={talents.OBLITERATE_TALENT.id} />
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.howTracker.map((cast, idx) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={talents.HORN_OF_WINTER_TALENT.id} />
            </>
          );
          const checklistItems: CooldownExpandableItem[] = [];
          const runicPowerPerf = cast.wastedRp
            ? QualitativePerformance.Fail
            : QualitativePerformance.Good;
          checklistItems.push({
            label: 'Runic Power Gained',
            result: <PerformanceMark perf={runicPowerPerf} />,
            details: <>{cast.gainedRp - cast.wastedRp}</>,
          });

          const runesPerf = cast.wastedRunes
            ? QualitativePerformance.Fail
            : QualitativePerformance.Good;
          checklistItems.push({
            label: 'Runes Gained',
            result: <PerformanceMark perf={runesPerf} />,
            details: <>{cast.gainedRunes - cast.wastedRunes}</>,
          });

          let overallPerf = QualitativePerformance.Good;
          if (cast.wastedRp > 0 || cast.wastedRunes > 0) {
            overallPerf = QualitativePerformance.Ok;
          }
          if (cast.wastedRp > 0 && cast.wastedRp) {
            overallPerf = QualitativePerformance.Ok;
          }

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={idx}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
