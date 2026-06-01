import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  EmpowerEndEvent,
  EventType,
  FightEndEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const {
  DISINTEGRATE,
  FIRE_BREATH,
  FIRE_BREATH_FONT,
  ETERNITY_SURGE,
  ETERNITY_SURGE_FONT,
  ESSENCE_BURST_DEV_BUFF,
} = SPELLS;

const { DRAGONRAGE_TALENT, PYRE_TALENT } = TALENTS_EVOKER;

const EXTENSION_PERFORMANCE_THRESHHOLDS = {
  PERFECT: 6,
  GOOD: 4,
};

const EMPOWER_PERFORMANCE_THRESHHOLDS = {
  PERFECT: 3,
  GOOD: 2,
};

export interface RageWindowCounter {
  start: number;
  fireBreaths: number;
  eternitySurges: number;
  extensionPerf: QualitativePerformance;
  fireBreathPerf: QualitativePerformance;
  eternitySurgePerf: QualitativePerformance;
  essenceBursts: number;
  pyres: number;
  disintegrateTicks: number;
  end: number;
  fightEndDuringDR: boolean;
}

class DragonRage extends Analyzer {
  totalBreaths = 0;
  totalApplications = 0;
  totalCasts = 0;
  inDragonRageWindow = false;
  rageWindowCounters: Record<number, RageWindowCounter> = {};

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT),
      (event) => {
        this.onApplyDragonrage(event);
      },
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT),
      (event) => {
        this.onDragonrageEnd(event);
      },
    );

    this.addEventListener(Events.fightend, (event) => {
      this.onDragonrageEnd(event);
    });

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(ESSENCE_BURST_DEV_BUFF),
      () => {
        if (!this.inDragonRageWindow) {
          return;
        }

        this.currentRageWindow.essenceBursts += 1;
      },
    );

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([DISINTEGRATE]), () => {
      if (!this.inDragonRageWindow) {
        return;
      }

      this.currentRageWindow.disintegrateTicks += 1;
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(PYRE_TALENT), () => {
      if (!this.inDragonRageWindow) {
        return;
      }

      this.currentRageWindow.pyres += 1;
    });

    this.addEventListener(
      Events.empowerEnd
        .by(SELECTED_PLAYER)
        .spell([FIRE_BREATH, FIRE_BREATH_FONT, ETERNITY_SURGE, ETERNITY_SURGE_FONT]),
      (event) => {
        this.onEmpowerCast(event);
      },
    );
  }

  onApplyDragonrage(event: ApplyBuffEvent) {
    this.inDragonRageWindow = true;
    this.totalCasts += 1;
    this.rageWindowCounters[this.totalCasts] = {
      start: event.timestamp,
      fireBreaths: 0,
      eternitySurges: 0,
      essenceBursts: 0,
      disintegrateTicks: 0,
      pyres: 0,
      end: 0,
      fightEndDuringDR: false,
      extensionPerf: QualitativePerformance.Fail,
      eternitySurgePerf: QualitativePerformance.Fail,
      fireBreathPerf: QualitativePerformance.Fail,
    };
  }

  onDragonrageEnd(event: RemoveBuffEvent | FightEndEvent) {
    if (this.inDragonRageWindow) {
      this.inDragonRageWindow = false;
      if (this.rageWindowCounters[this.totalCasts] === undefined) {
        return;
      }
      if (event.type === EventType.FightEnd)
        this.rageWindowCounters[this.totalCasts].fightEndDuringDR = true;

      this.rageWindowCounters[this.totalCasts].end = event.timestamp;

      this.rageWindowCounters[this.totalCasts].fireBreathPerf = this.evaluateEmpowerPerformance(
        this.rageWindowCounters[this.totalCasts].fireBreaths,
      );

      this.rageWindowCounters[this.totalCasts].eternitySurgePerf = this.evaluateEmpowerPerformance(
        this.rageWindowCounters[this.totalCasts].eternitySurges,
      );

      const extensions =
        this.rageWindowCounters[this.totalCasts].fireBreaths +
        this.rageWindowCounters[this.totalCasts].eternitySurges;

      this.rageWindowCounters[this.totalCasts].extensionPerf =
        extensions >= EXTENSION_PERFORMANCE_THRESHHOLDS.PERFECT
          ? QualitativePerformance.Perfect
          : extensions >= EXTENSION_PERFORMANCE_THRESHHOLDS.GOOD
            ? QualitativePerformance.Good
            : this.rageWindowCounters[this.totalCasts].fightEndDuringDR
              ? QualitativePerformance.Ok
              : QualitativePerformance.Fail;
    }
  }

  private evaluateEmpowerPerformance(castCount: number) {
    return castCount >= EMPOWER_PERFORMANCE_THRESHHOLDS.PERFECT
      ? QualitativePerformance.Perfect
      : castCount >= EMPOWER_PERFORMANCE_THRESHHOLDS.GOOD
        ? QualitativePerformance.Good
        : this.rageWindowCounters[this.totalCasts].fightEndDuringDR
          ? QualitativePerformance.Ok
          : QualitativePerformance.Fail;
  }

  onEmpowerCast(event: CastEvent | EmpowerEndEvent) {
    if (!this.inDragonRageWindow) {
      return;
    }

    switch (event.ability.name) {
      case FIRE_BREATH.name:
        this.currentRageWindow.fireBreaths += 1;
        break;
      case ETERNITY_SURGE.name:
        this.currentRageWindow.eternitySurges += 1;
        break;
    }
  }

  get currentRageWindow() {
    return this.rageWindowCounters[this.totalCasts];
  }
}

export default DragonRage;
