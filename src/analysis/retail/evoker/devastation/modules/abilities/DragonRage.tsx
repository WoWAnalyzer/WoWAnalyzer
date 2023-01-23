import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

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
        };
      },
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT),
      (event) => {
        this.inDragonRageWindow = false;
        this.rageWindowCounters[this.totalCasts].end = event.timestamp;
      },
    );

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
      },
    );
  }

  get currentRageWindow() {
    return this.rageWindowCounters[this.totalCasts];
  }
}

export default DragonRage;
