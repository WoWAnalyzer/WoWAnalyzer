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
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SECRET_INFUSION_BUFFS, getCurrentRSKTalent } from '../../constants';
import { PerformanceMark } from 'interface/guide';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Haste from 'parser/shared/modules/Haste';
import Pets from 'parser/shared/modules/Pets';
import InformationIcon from 'interface/icons/Information';
import { Talent } from 'common/TALENTS/types';

const siDebug = false;

export interface BaseCelestialTracker {
  timestamp: number; // timestamp of celestial cast
  totalEnvM: number; // total envm casts
  averageHaste: number; // average haste during celestial
  totmStacks: number; // number of stacks of TOTM prior to casting Chiji
  deathTimestamp: number; // when pet died
  castRsk: boolean; // true if player cast rsk during yulon
  siBuffId: number | undefined; // true if SI buff was active at the beginning of celestial
}
const ENVM_HASTE_FACTOR = 0.55; // this factor determines how harsh to be for ideal envm casts
const CHIJI_GIFT_ENVMS = 2.5;
const YULON_GIFT_ENVMS = 4;

class BaseCelestialAnalyzer extends Analyzer {
  static dependencies = {
    haste: Haste,
    pets: Pets,
  };
  protected haste!: Haste;
  protected pets!: Pets;

  //celestial vars
  celestialActive = false;
  currentCelestialStart = -1;
  lastCelestialEnd = -1;
  celestialWindows: Map<number, number> = new Map<number, number>();
  castTrackers: BaseCelestialTracker[] = [];
  hasteDataPoints: number[] = []; // use this to estimate average haste during celestial
  idealEnvmCastsUnhasted = 0;
  currentRskTalent: Talent;
  secretInfusionActive = false;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT);
    this.currentRskTalent = getCurrentRSKTalent(this.selectedCombatant);
    this.secretInfusionActive = this.selectedCombatant.hasTalent(
      TALENTS_MONK.SECRET_INFUSION_TALENT,
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
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.onEnvmCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onAction);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onAction);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onAction);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.currentRskTalent), this.onRsk);
    const idealEnvmCastsUnhastedForGift = this.selectedCombatant.hasTalent(
      TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
    )
      ? CHIJI_GIFT_ENVMS
      : YULON_GIFT_ENVMS;
    this.idealEnvmCastsUnhasted =
      idealEnvmCastsUnhastedForGift *
      (1 + this.selectedCombatant.getTalentRank(TALENTS_MONK.JADE_BOND_TALENT));
  }

  onSummon(event: CastEvent) {
    this.celestialActive = true;
    this.currentCelestialStart = event.timestamp;
    this.hasteDataPoints = [];
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
    siDebug && console.log('Celestial Death: ', this.owner.formatTimestamp(event.timestamp));
    this.celestialActive = false;
    this.celestialWindows.set(this.currentCelestialStart, event.timestamp);
    this.currentCelestialStart = -1;
    this.lastCelestialEnd = event.timestamp;
    this.castTrackers.at(-1)!.averageHaste = this.curAverageHaste;
    this.castTrackers.at(-1)!.deathTimestamp = event.timestamp;
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

  onEnvmCast(event: CastEvent) {
    if (!this.celestialActive) {
      return;
    }
    this.castTrackers.at(-1)!.totalEnvM += 1;
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
    return [allPerfs, checklistItems];
  }

  private getSiBuffType(cast: BaseCelestialTracker): string {
    console.log(cast);
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
