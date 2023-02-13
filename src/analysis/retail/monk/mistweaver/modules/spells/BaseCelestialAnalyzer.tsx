import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent, DeathEvent, CastEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SECRET_INFUSION_BUFFS, LESSONS_BUFFS } from '../../constants';
import EssenceFont from './EssenceFont';
import { PerformanceMark } from 'interface/guide';
import SPELLS from 'common/SPELLS';

export interface BaseCelestialTracker {
  lessonsDuration: number;
  infusionDuration: number;
  timestamp: number;
}

class BaseCelestialAnalyzer extends Analyzer {
  static dependencies = {
    ef: EssenceFont,
  };
  siApplyTime: number = -1;
  lessonsApplyTime: number = -1;
  celestialActive: boolean = false;
  castTrackers: BaseCelestialTracker[] = [];
  goodSiDuration: number = 0; // how long SI should last during celestial
  goodLessonDuration: number = 0; // how long lesson should last during celestial
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT),
      this.onCast,
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
    this.goodSiDuration = 10000;
    this.goodLessonDuration =
      12000 *
      (2 - this.selectedCombatant.getTalentRank(TALENTS_MONK.GIFT_OF_THE_CELESTIALS_TALENT));
  }

  onCast(event: CastEvent) {
    this.celestialActive = true;
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

  applySi(event: ApplyBuffEvent) {
    this.siApplyTime = event.timestamp;
  }

  applyLessons(event: ApplyBuffEvent) {
    this.lessonsApplyTime = event.timestamp;
  }

  removeSi(event: RemoveBuffEvent | DeathEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.infusionDuration = event.timestamp - this.siApplyTime;
  }

  removeLessons(event: RemoveBuffEvent | DeathEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.lessonsDuration = event.timestamp - this.siApplyTime;
  }

  getCooldownExpandableItems(
    cast: BaseCelestialTracker,
  ): [QualitativePerformance[], CooldownExpandableItem[]] {
    const allPerfs: QualitativePerformance[] = [];

    const checklistItems: CooldownExpandableItem[] = [];
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
        details: <>{(cast.infusionDuration! / 1000).toFixed(2)}s</>,
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
        details: <>{(cast.lessonsDuration! / 1000).toFixed(2)}s</>,
      });
    }
    return [allPerfs, checklistItems];
  }

  handleCelestialDeath(event: DeathEvent | RemoveBuffEvent) {
    this.celestialActive = false;
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
