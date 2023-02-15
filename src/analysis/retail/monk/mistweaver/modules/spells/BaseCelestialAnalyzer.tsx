import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  RemoveBuffEvent,
  DeathEvent,
  CastEvent,
  SummonEvent,
  RefreshBuffEvent,
  HealEvent,
  DamageEvent,
  EndChannelEvent,
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SECRET_INFUSION_BUFFS, LESSONS_BUFFS } from '../../constants';
import EssenceFont from './EssenceFont';
import { PerformanceMark } from 'interface/guide';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Haste from 'parser/shared/modules/Haste';

export interface BaseCelestialTracker {
  lessonsDuration: number; // ms with Lessons buff
  infusionDuration: number; // ms with Secret Infusion buff
  timestamp: number; // timestamp of celestial cast
  totalEnvM: number; // total envm casts
  totalEnvB: number; // total envb applications
  averageHaste: number; // average haste during celestial
  numEfHots: number; // number of ef hots on raid prior to casting chiji
  totmStacks: number; // number of stacks of TOTM prior to casting Chiji
  recastEf: boolean; // whether player recast ef during celestial
  deathTimestamp: number; // when pet died
}

const ENVM_HASTE_FACTOR = 0.55; // this factor determines how harsh to be for ideal envm casts
const CHIJI_GIFT_ENVMS = 2.5;
const YULON_GIFT_ENVMS = 4;

class BaseCelestialAnalyzer extends Analyzer {
  static dependencies = {
    ef: EssenceFont,
    haste: Haste,
  };
  protected haste!: Haste;
  siApplyTime: number = -1;
  lessonsApplyTime: number = -1;
  celestialActive: boolean = false;
  castTrackers: BaseCelestialTracker[] = [];
  hasteDataPoints: number[] = []; // use this to estimate average haste during celestial
  goodSiDuration: number = 0; // how long SI should last during celestial
  goodLessonDuration: number = 0; // how long lesson should last during celestial
  idealEnvmCastsUnhasted: number = 0;
  minEfHotsBeforeCast: number = 0;
  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT);
    this.addEventListener(Events.summon.to(SELECTED_PLAYER_PET), this.onSummon);
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
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.handleEfEnd,
    );
    const idealEnvmCastsUnhastedForGift = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
    )
      ? CHIJI_GIFT_ENVMS
      : YULON_GIFT_ENVMS;
    this.idealEnvmCastsUnhasted =
      idealEnvmCastsUnhastedForGift *
      (1 + this.selectedCombatant.getTalentRank(TALENTS_MONK.JADE_BOND_TALENT));
    this.minEfHotsBeforeCast =
      10 + 6 * this.selectedCombatant.getTalentRank(TALENTS_MONK.UPWELLING_TALENT);
    this.goodSiDuration = 10000; // base si duration
    this.goodLessonDuration = this.selectedCombatant.hasTalent(
      TALENTS_MONK.GIFT_OF_THE_CELESTIALS_TALENT,
    )
      ? 12000
      : 25000;
  }

  onSummon(event: SummonEvent) {
    this.celestialActive = true;
    this.hasteDataPoints = [];
    SECRET_INFUSION_BUFFS.forEach((spell) => {
      if (this.selectedCombatant.hasBuff(spell.id)) {
        this.siApplyTime = event.timestamp;
      }
    });
    LESSONS_BUFFS.forEach((spell) => {
      if (this.selectedCombatant.hasBuff(spell.id)) {
        this.lessonsApplyTime = event.timestamp;
      }
    });
  }

  onAction(event: HealEvent | CastEvent | DamageEvent) {
    this.hasteDataPoints.push(this.haste.current);
  }

  getEfRefreshPerfAndItem(
    cast: BaseCelestialTracker,
  ): [QualitativePerformance, CooldownExpandableItem] {
    const recastPerf = cast.recastEf ? QualitativePerformance.Good : QualitativePerformance.Fail;
    return [
      recastPerf,
      {
        label: (
          <>
            Recast <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT} /> during celestial
          </>
        ),
        result: <PerformanceMark perf={recastPerf} />,
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
    this.castTrackers.at(-1)!.totalEnvB += 1;
  }

  applySi(event: ApplyBuffEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.siApplyTime = event.timestamp;
  }

  applyLessons(event: ApplyBuffEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.lessonsApplyTime = event.timestamp;
  }

  removeSi(event: RemoveBuffEvent | DeathEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.infusionDuration = event.timestamp - this.siApplyTime;
  }

  removeLessons(event: RemoveBuffEvent) {
    if (
      this.castTrackers.length === 0 ||
      this.castTrackers.at(-1)!.lessonsDuration > 0 ||
      (this.castTrackers.at(-1)!.deathTimestamp > 0 &&
        this.castTrackers.at(-1)!.deathTimestamp < this.lessonsApplyTime)
    ) {
      return;
    }
    /**
     * 4 cases
     *       | SUMMON |  duration  | DEATH |
     * 1) App             Remove
     * 2) App                                Remove
     * 3)               App Remove
     * 4)                 App                Remove
     */
    if (this.lessonsApplyTime < event.timestamp) {
      this.castTrackers.at(-1)!.lessonsDuration = this.celestialActive
        ? event.timestamp - this.castTrackers.at(-1)!.timestamp // case 1
        : this.castTrackers.at(-1)!.deathTimestamp - this.castTrackers.at(-1)!.timestamp; // case 2
    } else {
      this.castTrackers.at(-1)!.lessonsDuration = this.celestialActive
        ? event.timestamp - this.lessonsApplyTime // case 3
        : this.castTrackers.at(-1)!.deathTimestamp - this.lessonsApplyTime; // case 4
    }
  }

  getExpectedEnvmCasts(avgHaste: number) {
    return this.idealEnvmCastsUnhasted * (1 + avgHaste * ENVM_HASTE_FACTOR);
  }

  handleEfEnd(event: EndChannelEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.recastEf = true;
  }

  getCooldownExpandableItems(
    cast: BaseCelestialTracker,
  ): [QualitativePerformance[], CooldownExpandableItem[]] {
    const checklistItems: CooldownExpandableItem[] = [];
    let envbPerf = QualitativePerformance.Good;
    const avgBreathsPerCast = cast.totalEnvB / cast.totalEnvM;
    if (avgBreathsPerCast < 4) {
      envbPerf = QualitativePerformance.Ok;
    } else if (avgBreathsPerCast < 3) {
      envbPerf = QualitativePerformance.Fail;
    }
    checklistItems.push({
      label: (
        <>
          Average <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id} /> per{' '}
          <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> cast
        </>
      ),
      result: <PerformanceMark perf={envbPerf} />,
      details: <>{avgBreathsPerCast.toFixed(1)} avg per cast</>,
    });
    let envmPerf = QualitativePerformance.Good;
    const idealEnvm = this.getExpectedEnvmCasts(cast.averageHaste);
    if (cast.totalEnvM < idealEnvm - 1) {
      envmPerf = QualitativePerformance.Ok;
    } else if (cast.totalEnvM < idealEnvm - 2) {
      envmPerf = QualitativePerformance.Fail;
    }
    checklistItems.push({
      label: (
        <>
          Sufficient # of <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> casts
        </>
      ),
      result: <PerformanceMark perf={envmPerf} />,
      details: <>{formatNumber(cast.totalEnvM)} casts</>,
    });

    let efPerf = QualitativePerformance.Good;
    if (cast.numEfHots < Math.floor(this.minEfHotsBeforeCast * 0.75)) {
      efPerf = QualitativePerformance.Fail;
    } else if (cast.numEfHots < Math.floor(this.minEfHotsBeforeCast * 0.9)) {
      efPerf = QualitativePerformance.Ok;
    }
    checklistItems.push({
      label: (
        <>
          Sufficient <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT} /> HoTs on cast
        </>
      ),
      result: <PerformanceMark perf={efPerf} />,
      details: <>{cast.numEfHots} HoTs</>,
    });
    const allPerfs: QualitativePerformance[] = [envbPerf, efPerf, envmPerf];

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.SECRET_INFUSION_TALENT)) {
      let siPerf = QualitativePerformance.Good;
      if (cast.infusionDuration! < this.goodSiDuration - 4000) {
        siPerf = QualitativePerformance.Fail;
      } else if (cast.infusionDuration! < this.goodSiDuration - 2000) {
        siPerf = QualitativePerformance.Ok;
      }
      allPerfs.push(siPerf);
      checklistItems.push({
        label: (
          <>
            <SpellLink id={TALENTS_MONK.SECRET_INFUSION_TALENT} /> uptime
          </>
        ),
        result: <PerformanceMark perf={siPerf} />,
        details: <>{Math.round(cast.infusionDuration! / 1000)}s</>,
      });
    }
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
            <SpellLink id={TALENTS_MONK.SHAOHAOS_LESSONS_TALENT} /> uptime
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

  handleCelestialDeath(event: DeathEvent | RemoveBuffEvent) {
    this.celestialActive = false;
    this.castTrackers.at(-1)!.averageHaste = this.curAverageHaste;
    this.castTrackers.at(-1)!.deathTimestamp = event.timestamp;
    const hasInfusion = SECRET_INFUSION_BUFFS.some((spell) => {
      return this.selectedCombatant.hasBuff(spell.id);
    });
    const hasLesson = LESSONS_BUFFS.some((spell) => {
      return this.selectedCombatant.hasBuff(spell.id);
    });
    if (hasInfusion) {
      this.castTrackers.at(-1)!.infusionDuration = Math.min(
        event.timestamp - this.siApplyTime,
        event.timestamp - this.castTrackers.at(-1)!.timestamp,
      );
    }
    if (hasLesson) {
      this.castTrackers.at(-1)!.lessonsDuration = Math.min(
        event.timestamp - this.lessonsApplyTime,
        event.timestamp - this.castTrackers.at(-1)!.timestamp,
      );
    }
  }
}

export default BaseCelestialAnalyzer;
