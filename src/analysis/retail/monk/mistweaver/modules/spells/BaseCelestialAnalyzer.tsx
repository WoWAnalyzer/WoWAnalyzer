import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, Tooltip } from 'interface';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  RemoveBuffEvent,
  DeathEvent,
  CastEvent,
  RefreshBuffEvent,
  HealEvent,
  DamageEvent,
  EventType,
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SECRET_INFUSION_BUFFS, LESSONS_BUFFS } from '../../constants';
import { PerformanceMark } from 'interface/guide';
import SPELLS from 'common/SPELLS';
import { formatDurationMillisMinSec, formatNumber } from 'common/format';
import Haste from 'parser/shared/modules/Haste';
import Pets from 'parser/shared/modules/Pets';
import InformationIcon from 'interface/icons/Information';
import EnvelopingBreath from './EnvelopingBreath';

export interface BaseCelestialTracker {
  lessonsDuration: number; // ms with Lessons buff
  infusionDuration: number; // ms with Secret Infusion buff
  timestamp: number; // timestamp of celestial cast
  totalEnvM: number; // total envm casts
  totalEnvB: number; // total envb applications
  averageHaste: number; // average haste during celestial
  totmStacks: number; // number of stacks of TOTM prior to casting Chiji
  deathTimestamp: number; // when pet died
  castRsk: boolean; // true if player cast rsk during yulon
}
const lessonsDebug = false;
const siDebug = false;
const ENVM_HASTE_FACTOR = 0.55; // this factor determines how harsh to be for ideal envm casts
const CHIJI_GIFT_ENVMS = 2.5;
const YULON_GIFT_ENVMS = 4;

class BaseCelestialAnalyzer extends Analyzer {
  static dependencies = {
    envb: EnvelopingBreath,
    haste: Haste,
    pets: Pets,
  };
  protected haste!: Haste;
  protected pets!: Pets;

  //secret infusion vars
  siApplyTime: number = -1;
  secretInfusionActive: boolean = false;
  goodSiDuration: number = 0; // how long SI should last during celestial

  //shaohaos lessons vars
  lessonsApplyTime: number = -1;
  lessonsActive: boolean = false;
  goodLessonDuration: number = 0; // how long lesson should last during celestial

  //celestial vars
  celestialActive: boolean = false;
  currentCelestialStart: number = -1;
  lastCelestialEnd: number = -1;
  celestialWindows: Map<number, number> = new Map<number, number>();
  castTrackers: BaseCelestialTracker[] = [];
  hasteDataPoints: number[] = []; // use this to estimate average haste during celestial
  idealEnvmCastsUnhasted: number = 0;
  minEfHotsBeforeCast: number = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT);
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
          TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT,
        ]),
      this.onSummon,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SECRET_INFUSION_BUFFS),
      this.applySi,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(LESSONS_BUFFS),
      this.applyLessons,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SECRET_INFUSION_BUFFS),
      this.removeSi,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(LESSONS_BUFFS),
      this.removeLessons,
    );
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.handleCelestialDeath);
    this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.handleCelestialDeath);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_YULON_BUFF),
      this.handleCelestialDeath,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.onEnvmCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.onEnvbApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH_HEAL),
      this.onEnvbApply,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAction);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onAction);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onAction);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RISING_SUN_KICK_TALENT),
      this.onRsk,
    );
    const idealEnvmCastsUnhastedForGift = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
    )
      ? CHIJI_GIFT_ENVMS
      : YULON_GIFT_ENVMS;
    this.idealEnvmCastsUnhasted =
      idealEnvmCastsUnhastedForGift *
      (1 + this.selectedCombatant.getTalentRank(TALENTS_MONK.JADE_BOND_TALENT));
    this.goodSiDuration = this.selectedCombatant.hasTalent(
      TALENTS_MONK.GIFT_OF_THE_CELESTIALS_TALENT,
    )
      ? 4000
      : 10000;
    this.goodLessonDuration = this.selectedCombatant.hasTalent(
      TALENTS_MONK.GIFT_OF_THE_CELESTIALS_TALENT,
    )
      ? 12000
      : 25000;
  }

  onSummon(event: CastEvent) {
    (lessonsDebug || siDebug) &&
      console.log('Celestial Summoned: ', this.owner.formatTimestamp(event.timestamp));
    this.celestialActive = true;
    this.currentCelestialStart = event.timestamp;
    this.hasteDataPoints = [];
    if (this.secretInfusionActive) {
      this.siApplyTime = event.timestamp;
    }
    if (this.lessonsActive) {
      this.lessonsApplyTime = event.timestamp;
    }
  }

  onRsk(event: CastEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.castRsk = true;
  }

  handleCelestialDeath(event: DeathEvent | RemoveBuffEvent) {
    // only chiji logs death events
    if (event.type === EventType.Death) {
      const pet = this.pets.getEntityFromEvent(event, true);
      if (!pet || !pet.name) {
        return;
      }
    }
    (lessonsDebug || siDebug) &&
      console.log('Celestial Death: ', this.owner.formatTimestamp(event.timestamp));
    this.celestialActive = false;
    this.celestialWindows.set(this.currentCelestialStart, event.timestamp);
    this.currentCelestialStart = -1;
    this.lastCelestialEnd = event.timestamp;
    this.castTrackers.at(-1)!.averageHaste = this.curAverageHaste;
    this.castTrackers.at(-1)!.deathTimestamp = event.timestamp;
    if (this.secretInfusionActive) {
      this.castTrackers.at(-1)!.infusionDuration = event.timestamp - this.siApplyTime;
      siDebug &&
        console.log(
          'SI Duration: ',
          formatDurationMillisMinSec(event.timestamp - this.siApplyTime),
        );
    }
    if (this.lessonsActive) {
      this.castTrackers.at(-1)!.lessonsDuration = event.timestamp - this.lessonsApplyTime;
      lessonsDebug &&
        console.log(
          'Lessons Duration: ',
          formatDurationMillisMinSec(event.timestamp - this.lessonsApplyTime),
        );
    }
  }

  onAction(event: HealEvent | CastEvent | DamageEvent) {
    this.hasteDataPoints.push(this.haste.current);
  }

  getRskCastPerfAndItem(
    cast: BaseCelestialTracker,
  ): [QualitativePerformance, CooldownExpandableItem] {
    const castPerf = cast.castRsk ? QualitativePerformance.Good : QualitativePerformance.Fail;
    return [
      castPerf,
      {
        label: (
          <>
            Cast <SpellLink spell={TALENTS_MONK.RISING_SUN_KICK_TALENT} />
          </>
        ),
        result: <PerformanceMark perf={castPerf} />,
        details: cast.castRsk ? <>Yes</> : <>No</>,
      },
    ];
  }

  onEnvmCast(event: CastEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.totalEnvM += 1;
  }

  onEnvbApply(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.totalEnvB += 1;
  }

  /**
   * 4 cases for shaohaos lessons and SI logic:
   *       | SUMMON |  duration  | DEATH |
   * 1) App             Remove
   * 2) App                                Remove
   * 3)               App Remove
   * 4)                 App                Remove
   */

  applySi(event: ApplyBuffEvent) {
    siDebug && console.log('SI Applied: ', this.owner.formatTimestamp(event.timestamp));
    this.secretInfusionActive = true;
    this.siApplyTime = event.timestamp;
  }

  applyLessons(event: ApplyBuffEvent) {
    lessonsDebug && console.log('Lessons Applied: ', this.owner.formatTimestamp(event.timestamp));
    this.lessonsActive = true;
    this.lessonsApplyTime = event.timestamp;
  }

  removeSi(event: RemoveBuffEvent) {
    this.secretInfusionActive = false;
    if (this.celestialActive) {
      this.castTrackers.at(-1)!.infusionDuration = event.timestamp - this.siApplyTime;
      siDebug &&
        console.log(
          'SI Duration: ',
          formatDurationMillisMinSec(event.timestamp - this.siApplyTime),
        );
    }
    siDebug && console.log('SI Removed: ', this.owner.formatTimestamp(event.timestamp));
  }

  removeLessons(event: RemoveBuffEvent) {
    lessonsDebug && console.log('Lessons Removed: ', this.owner.formatTimestamp(event.timestamp));
    this.lessonsActive = false;
    if (this.celestialActive) {
      this.castTrackers.at(-1)!.lessonsDuration = event.timestamp - this.lessonsApplyTime;
      lessonsDebug &&
        console.log(
          'Lessons Duration: ',
          formatDurationMillisMinSec(event.timestamp - this.lessonsApplyTime),
        );
    }
  }

  getExpectedEnvmCasts(avgHaste: number) {
    return this.idealEnvmCastsUnhasted * (1 + avgHaste * ENVM_HASTE_FACTOR);
  }

  getCelestialTalent() {
    return this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)
      ? TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT
      : TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT;
  }

  getCooldownExpandableItems(
    cast: BaseCelestialTracker,
  ): [QualitativePerformance[], CooldownExpandableItem[]] {
    const checklistItems: CooldownExpandableItem[] = [];
    const allPerfs: QualitativePerformance[] = [];

    //average enveloping breath targets
    let envbPerf = QualitativePerformance.Good;
    const avgBreathsPerCast = cast.totalEnvB / cast.totalEnvM;
    if (avgBreathsPerCast < 4) {
      envbPerf = QualitativePerformance.Ok;
    } else if (avgBreathsPerCast < 3) {
      envbPerf = QualitativePerformance.Fail;
    }
    allPerfs.push(envbPerf);
    checklistItems.push({
      label: (
        <>
          <SpellLink spell={SPELLS.ENVELOPING_BREATH_HEAL} />s applied per{' '}
          <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />
        </>
      ),
      result: <PerformanceMark perf={envbPerf} />,
      details: <>{avgBreathsPerCast.toFixed(1)} avg</>,
    });

    //enveloping mist casts
    let envmPerf = QualitativePerformance.Good;
    const idealEnvm = this.getExpectedEnvmCasts(cast.averageHaste);
    if (cast.totalEnvM < idealEnvm - 1) {
      envmPerf = QualitativePerformance.Ok;
    } else if (cast.totalEnvM < idealEnvm - 2) {
      envmPerf = QualitativePerformance.Fail;
    }
    allPerfs.push(envmPerf);
    checklistItems.push({
      label: (
        <>
          <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> casts
        </>
      ),
      result: <PerformanceMark perf={envmPerf} />,
      details: <>{formatNumber(cast.totalEnvM)}</>,
    });

    //secret infusion duration
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.SECRET_INFUSION_TALENT)) {
      let siPerf = QualitativePerformance.Good;
      if (cast.infusionDuration! < this.goodSiDuration / 3) {
        siPerf = QualitativePerformance.Fail;
      } else if (cast.infusionDuration! < this.goodSiDuration * (2 / 3)) {
        siPerf = QualitativePerformance.Ok;
      }
      allPerfs.push(siPerf);
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} /> uptime{' '}
            <Tooltip
              hoverable
              content={
                <>
                  Be sure to use <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> with{' '}
                  <SpellLink spell={TALENTS_MONK.RENEWING_MIST_TALENT} /> for a multiplicative haste
                  bonus
                </>
              }
            >
              <span>
                <InformationIcon />
              </span>
            </Tooltip>
          </>
        ),
        result: <PerformanceMark perf={siPerf} />,
        details: <>{Math.round(cast.infusionDuration! / 1000)}s</>,
      });
    }

    //shaohao's lessons buff duration
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.SHAOHAOS_LESSONS_TALENT)) {
      let lessonPerf = QualitativePerformance.Good;
      if (cast.lessonsDuration! < this.goodLessonDuration / 3) {
        lessonPerf = QualitativePerformance.Fail;
      } else if (cast.lessonsDuration! < this.goodLessonDuration * (2 / 3)) {
        lessonPerf = QualitativePerformance.Ok;
      }
      allPerfs.push(lessonPerf);
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT} /> uptime{' '}
            <Tooltip
              hoverable
              content={
                <>
                  Cast <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> with enough clouds to
                  cover the entire duration of <SpellLink spell={this.getCelestialTalent()} />
                </>
              }
            >
              <span>
                <InformationIcon />
              </span>
            </Tooltip>
          </>
        ),
        result: <PerformanceMark perf={lessonPerf} />,
        details: <>{Math.round(cast.lessonsDuration! / 1000)}s</>,
      });
    }
    return [allPerfs, checklistItems];
  }

  get curAverageHaste() {
    return (
      this.hasteDataPoints.reduce((accum, cur) => {
        return accum + cur;
      }, 0) / this.hasteDataPoints.length
    );
  }
}

export default BaseCelestialAnalyzer;
