import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  FightEndEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';

const {
  DISINTEGRATE,
  FIRE_BREATH,
  FIRE_BREATH_FONT,
  ETERNITY_SURGE,
  ETERNITY_SURGE_FONT,
  ESSENCE_BURST_DEV_BUFF,
} = SPELLS;

const { DRAGONRAGE_TALENT, ESSENCE_BURST_TALENT, PYRE_TALENT } = TALENTS_EVOKER;

export type RageWindowCounter = {
  start: number;
  fireBreaths: number;
  eternitySurges: number;
  essenceBursts: number;
  pyres: number;
  disintegrateTicks: number;
  end: number;
  fightEndDuringDR: boolean;
};

class DragonRage extends Analyzer {
  totalBreaths: number = 0;
  totalApplications: number = 0;
  totalCasts: number = 0;
  inDragonRageWindow: boolean = false;
  rageWindowCounters: {
    [window: number]: RageWindowCounter;
  } = {};

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
        this.onRemoveDragonrage(event);
      },
    );

    this.addEventListener(Events.fightend, (event) => {
      this.endOfFightCheck(event);
    });

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([ESSENCE_BURST_DEV_BUFF, ESSENCE_BURST_TALENT]),
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

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([FIRE_BREATH, FIRE_BREATH_FONT, ETERNITY_SURGE, ETERNITY_SURGE_FONT, PYRE_TALENT]),
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
    };
  }

  onRemoveDragonrage(event: RemoveBuffEvent) {
    this.inDragonRageWindow = false;
    if (this.rageWindowCounters[this.totalCasts] === undefined) {
      return;
    }
    this.rageWindowCounters[this.totalCasts].end = event.timestamp;
    // Janky solution to fix statistics window outputting more empower cast than actually occoured inside of DR window
    // Still shows the spell in windowed timeline
    // TODO: Proper solution would be to change empower logic all together so this doesn't happen in the first place
    if ((this.currentRageWindow.end - this.currentRageWindow.start) / 1000 < 35) {
      if (this.currentRageWindow.fireBreaths > 2) {
        this.currentRageWindow.fireBreaths = 2;
      }
      if (this.currentRageWindow.eternitySurges > 2) {
        this.currentRageWindow.eternitySurges = 2;
      }
    }
  }

  onEmpowerCast(event: CastEvent) {
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
      case PYRE_TALENT.name:
        this.currentRageWindow.pyres += 1;
        break;
    }
  }

  // Fix edgecase where DR window was registered but wasn't ended due to fight ending during the window
  endOfFightCheck(event: FightEndEvent) {
    if (this.inDragonRageWindow) {
      this.inDragonRageWindow = false;
      this.rageWindowCounters[this.totalCasts].fightEndDuringDR = true;
      this.rageWindowCounters[this.totalCasts].end = event.timestamp;
    }
  }

  get currentRageWindow() {
    return this.rageWindowCounters[this.totalCasts];
  }
}

export default DragonRage;
