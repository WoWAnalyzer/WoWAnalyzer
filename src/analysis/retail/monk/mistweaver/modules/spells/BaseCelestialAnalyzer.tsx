import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink, Tooltip } from 'interface';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  RemoveBuffEvent,
  DeathEvent,
  CastEvent,
  HealEvent,
  DamageEvent,
  EventType,
  ApplyBuffEvent,
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  HEART_OF_THE_JADE_SERPENT_DURATION,
  SECRET_INFUSION_BUFFS,
  getCurrentRSKTalent,
} from '../../constants';
import { PerformanceMark } from 'interface/guide';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Haste from 'parser/shared/modules/Haste';
import Pets from 'parser/shared/modules/Pets';
import InformationIcon from 'interface/icons/Information';
import { Talent } from 'common/TALENTS/types';
import { CelestialHooks } from 'analysis/retail/monk/shared';

const siDebug = false;

export interface BaseCelestialTracker {
  timestamp: number; // timestamp of celestial cast
  totalEnvM: number; // total envm casts
  averageHaste: number; // average haste during celestial
  totmStacks: number; // number of stacks of TOTM prior to casting Chiji
  deathTimestamp: number; // when pet died
  castRsk: boolean; // true if player cast rsk during yulon
  siBuffId: number | undefined; // true if SI buff was active at the beginning of celestial
  hotjsOnCast: boolean; // hotjs active at celestial cast time
  hotjsDuringWindow: boolean; // hotjs became active during celestial
  hotjsActiveDuration: number; // time in ms that hotjs was active during celestial
  spiritfontActiveDuring: boolean; // spiritfont active buff was present during celestial
}
const ENVM_HASTE_FACTOR = 0.55; // this factor determines how harsh to be for ideal envm casts
const CHIJI_GIFT_ENVMS = 2.5;
const YULON_GIFT_ENVMS = 4;

class BaseCelestialAnalyzer extends Analyzer {
  static dependencies = {
    celestialHooks: CelestialHooks,
    haste: Haste,
    pets: Pets,
  };
  protected celestialHooks!: CelestialHooks;
  protected haste!: Haste;
  protected pets!: Pets;

  //celestial vars
  currentCelestialStart = -1;
  lastCelestialEnd = -1;
  celestialWindows: Map<number, number> = new Map<number, number>();
  castTrackers: BaseCelestialTracker[] = [];
  hasteDataPoints: number[] = []; // use this to estimate average haste during celestial
  idealEnvmCastsUnhasted = 0;
  currentRskTalent: Talent;
  secretInfusionActive = false;
  isFlowingWisdomActive = false;
  isSpiritfontRank2Active = false;
  hotjsApplyTimestamp = -1;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT);

    this.currentRskTalent = getCurrentRSKTalent(this.selectedCombatant);

    this.secretInfusionActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.SECRET_INFUSION_TALENT,
    );
    this.isFlowingWisdomActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.FLOWING_WISDOM_TALENT,
    );
    this.isSpiritfontRank2Active = this.selectedCombatant.hasTalent(
      TALENTS_MONK.SPIRITFONT_2_MISTWEAVER_TALENT,
    );

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
          TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT,
        ]),
      this.onSummon,
    );
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.handleCelestialDeath);
    this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.handleCelestialDeath);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_YULON_BUFF),
      this.handleCelestialDeath,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAction);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onAction);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onAction);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.currentRskTalent), this.onRsk);
    this.addEventListener(Events.fightend, this.onFightEnd);

    if (this.isFlowingWisdomActive) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell([
          SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF, // hotjs from tft
          SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY, // technically fine, i suppose
        ]),
        this.onHotjsApply,
      );
      this.addEventListener(
        Events.removebuff
          .by(SELECTED_PLAYER)
          .spell([SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF, SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY]),
        this.onHotjsRemove,
      );
    }

    if (this.isSpiritfontRank2Active) {
      this.addEventListener(
        Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SPIRITFONT_ACTIVE_BUFF),
        this.onSpiritfontActive,
      );
    }

    const idealEnvmCastsUnhastedForGift = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
    )
      ? CHIJI_GIFT_ENVMS
      : YULON_GIFT_ENVMS;
    this.idealEnvmCastsUnhasted =
      idealEnvmCastsUnhastedForGift *
      (1 + this.selectedCombatant.getTalentRank(TALENTS_MONK.JADE_BOND_TALENT));
  }

  get celestialActive() {
    return this.celestialHooks.celestialActive;
  }

  protected createBaseTracker(event: CastEvent): BaseCelestialTracker {
    return {
      timestamp: event.timestamp,
      siBuffId: this.currentSIBuffId,
      totmStacks: this.selectedCombatant.getBuffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY.id),
      totalEnvM: 0,
      averageHaste: 0,
      deathTimestamp: 0,
      castRsk: false,
      hotjsOnCast:
        this.selectedCombatant.hasBuff(SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF.id) ||
        this.selectedCombatant.hasBuff(SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY.id),
      hotjsDuringWindow: false,
      hotjsActiveDuration: 0,
      spiritfontActiveDuring: false,
    };
  }

  onSummon(event: CastEvent) {
    this.currentCelestialStart = event.timestamp;
    this.hasteDataPoints = [];
  }

  onRsk(event: CastEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.castRsk = true;
  }

  onSpiritfontActive() {
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.spiritfontActiveDuring = true;
  }

  private finalizeCelestialWindow(endTimestamp: number) {
    this.celestialWindows.set(this.currentCelestialStart, endTimestamp);

    if (this.hotjsApplyTimestamp !== -1) {
      const duration =
        endTimestamp - Math.max(this.hotjsApplyTimestamp, this.currentCelestialStart);
      this.castTrackers.at(-1)!.hotjsActiveDuration += duration;
      this.hotjsApplyTimestamp = -1;
    }

    this.castTrackers.at(-1)!.averageHaste = this.curAverageHaste;
    this.castTrackers.at(-1)!.deathTimestamp = endTimestamp;
    this.currentCelestialStart = -1;
    this.lastCelestialEnd = endTimestamp;
  }

  handleCelestialDeath(event: DeathEvent | RemoveBuffEvent) {
    // only chiji logs death events
    if (event.type === EventType.Death) {
      const pet = this.pets.getEntityFromEvent(event, true);
      if (!pet || !pet.name) {
        return;
      }
    }
    siDebug && console.log('Celestial Death: ', this.owner.formatTimestamp(event.timestamp));
    this.finalizeCelestialWindow(event.timestamp);
  }

  onFightEnd() {
    if (this.currentCelestialStart !== -1 && this.castTrackers.length > 0) {
      this.finalizeCelestialWindow(this.owner.fight.end_time);
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
            Cast <SpellLink spell={this.currentRskTalent} />
          </>
        ),
        result: <PerformanceMark perf={castPerf} />,
        details: cast.castRsk ? <>Yes</> : <>No</>,
      },
    ];
  }

  onHotjsApply(event: ApplyBuffEvent) {
    this.hotjsApplyTimestamp = event.timestamp;
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.hotjsDuringWindow = true;
  }

  onHotjsRemove(event: RemoveBuffEvent) {
    if (this.hotjsApplyTimestamp === -1) {
      return;
    }

    if (this.celestialActive) {
      const duration =
        event.timestamp - Math.max(this.hotjsApplyTimestamp, this.currentCelestialStart);
      this.castTrackers.at(-1)!.hotjsActiveDuration += duration;
    }

    this.hotjsApplyTimestamp = -1;
  }

  getExpectedEnvmCasts(avgHaste: number) {
    return this.idealEnvmCastsUnhasted * (1 + avgHaste * ENVM_HASTE_FACTOR);
  }

  getCooldownExpandableItems(
    cast: BaseCelestialTracker,
  ): [QualitativePerformance[], CooldownExpandableItem[]] {
    const checklistItems: CooldownExpandableItem[] = [];
    const allPerfs: QualitativePerformance[] = [];

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
    if (this.secretInfusionActive) {
      let siPerf = QualitativePerformance.Good;
      if (!cast.siBuffId) {
        siPerf = QualitativePerformance.Fail;
      }
      allPerfs.push(siPerf);
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS_MONK.SECRET_INFUSION_TALENT} /> buff{' '}
            <Tooltip
              hoverable
              content={
                <>
                  Be sure to use <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> with{' '}
                  <SpellLink spell={SPELLS.RENEWING_MIST_CAST} /> for a multiplicative haste bonus
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
        details: <>{this.getSiBuffType(cast)}</>,
      });
    }

    // heart of the jade serpent (flowing wisdom) buff
    if (this.isFlowingWisdomActive) {
      let hotjsPerf = QualitativePerformance.Fail;
      // tolerance set for tft rem global, should be active on celestial press
      const expectedDuration = HEART_OF_THE_JADE_SERPENT_DURATION - 1.5 / (1 + cast.averageHaste);
      const okDuration = expectedDuration - HEART_OF_THE_JADE_SERPENT_DURATION / 2;

      if (cast.hotjsOnCast && cast.hotjsActiveDuration >= expectedDuration) {
        hotjsPerf = QualitativePerformance.Good;
      } else if (cast.hotjsOnCast || cast.hotjsActiveDuration >= okDuration) {
        hotjsPerf = QualitativePerformance.Ok;
      }

      allPerfs.push(hotjsPerf);
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} /> buff{' '}
            <Tooltip
              hoverable
              content={
                <>
                  Grants Haste with <SpellLink spell={TALENTS_MONK.FLOWING_WISDOM_TALENT} />. Cast{' '}
                  <strong>before</strong> celestial to avoid wasting GCDs.
                </>
              }
            >
              <span>
                <InformationIcon />
              </span>
            </Tooltip>
          </>
        ),
        result: <PerformanceMark perf={hotjsPerf} />,
        details: (
          <>
            {cast.hotjsActiveDuration > 0
              ? `${(cast.hotjsActiveDuration / 1000).toFixed(1)}s active`
              : 'None'}
          </>
        ),
      });
    }

    // spiritfont active - r2/3 of spiritfont increases envm/rsk further during it
    if (this.isSpiritfontRank2Active) {
      const spiritfontPerf = cast.spiritfontActiveDuring
        ? QualitativePerformance.Good
        : QualitativePerformance.Fail;
      allPerfs.push(spiritfontPerf);
      checklistItems.push({
        label: (
          <>
            <SpellLink spell={TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT} /> active buff
          </>
        ),
        result: <PerformanceMark perf={spiritfontPerf} />,
        details: <>{cast.spiritfontActiveDuring ? 'Yes' : 'No'}</>,
      });
    }

    return [allPerfs, checklistItems];
  }

  private getSiBuffType(cast: BaseCelestialTracker): string {
    siDebug && console.log(cast);
    if (cast.siBuffId === SPELLS.SECRET_INFUSION_CRIT_BUFF.id) {
      return 'Crit';
    }
    if (cast.siBuffId === SPELLS.SECRET_INFUSION_VERS_BUFF.id) {
      return 'Vers';
    }
    if (cast.siBuffId === SPELLS.SECRET_INFUSION_HASTE_BUFF.id) {
      return 'Haste';
    }
    return 'None';
  }

  get currentSIBuffId(): number | undefined {
    return SECRET_INFUSION_BUFFS.find((buff) => this.selectedCombatant.hasBuff(buff.id))?.id;
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
