import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';

const {
  DISINTEGRATE,
  FIRE_BREATH,
  FIRE_BREATH_FONT,
  ETERNITY_SURGE,
  ETERNITY_SURGE_FONT,
  LIVING_FLAME_DAMAGE,
  LIVING_FLAME_CAST,
  AZURE_STRIKE,
  SHATTERING_STAR,
} = SPELLS;

const { DRAGONRAGE_TALENT } = TALENTS_EVOKER;

class ShatteringStar extends Analyzer {
  totalBreaths: number = 0;
  totalApplications: number = 0;
  totalCasts: number = 0;
  isBuffOn: boolean = false;
  inDragonRageWindow: boolean = false;
  currentWindowSpells: CastEvent[] = [];
  counter: {
    [window: number]: {
      disintegrates: number;
      fireBreaths: number;
      eternitySurges: number;
      livingFlameCasts: number;
      azureStrikes: number;
    };
  } = {};

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SHATTERING_STAR),
      this.onApply,
    );
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT), () => {
      this.inDragonRageWindow = true;
    });
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(DRAGONRAGE_TALENT), () => {
      this.inDragonRageWindow = false;
    });

    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell([SHATTERING_STAR, DRAGONRAGE_TALENT]),
      this.onRemove,
    );

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell(
          [
            DISINTEGRATE,
            FIRE_BREATH,
            FIRE_BREATH_FONT,
            ETERNITY_SURGE,
            ETERNITY_SURGE_FONT,
            LIVING_FLAME_DAMAGE,
            LIVING_FLAME_CAST,
            AZURE_STRIKE,
          ].map((spell) => ({ id: spell.id })),
        ),
      this.onCast,
    );
  }

  onApply(buff: ApplyDebuffEvent) {
    if (this.inDragonRageWindow) {
      return;
    }

    this.totalCasts += 1;
    this.isBuffOn = true;
  }

  onRemove() {
    this.isBuffOn = false;

    if (this.currentWindowSpells.length > 0) {
      const windowCounter = {
        disintegrates: 0,
        fireBreaths: 0,
        eternitySurges: 0,
        livingFlameCasts: 0,
        azureStrikes: 0,
      };

      console.log(this.currentWindowSpells);

      this.currentWindowSpells.forEach((spell) => {
        switch (spell.ability.name) {
          case FIRE_BREATH.name:
            windowCounter.fireBreaths += 1;
            break;
          case DISINTEGRATE.name:
            windowCounter.disintegrates += 1;
            break;
          case ETERNITY_SURGE.name:
            windowCounter.eternitySurges += 1;
            break;
          case LIVING_FLAME_DAMAGE.name:
            windowCounter.livingFlameCasts += 1;
            break;
          case AZURE_STRIKE.name:
            windowCounter.azureStrikes += 1;
            break;

          default:
            break;
        }
      });

      this.counter[this.totalCasts] = windowCounter;
      this.currentWindowSpells = [];
    }
  }

  onCast(castEvent: CastEvent) {
    if (!this.isBuffOn) {
      return;
    }

    this.currentWindowSpells.push(castEvent);
  }

  get statistics() {
    const windowFrequencies = {
      singleDisintegrates: 0,
      multiDisintegrates: 0,
      eternitySurges: 0,
      fillers: 0,
    };

    Object.values(this.counter).forEach((window) => {
      if (window.disintegrates <= 1) {
        windowFrequencies.singleDisintegrates += 1;
      } else if (window.disintegrates > 1) {
        windowFrequencies.multiDisintegrates += 1;
      }
      if (window.eternitySurges > 0) {
        windowFrequencies.eternitySurges += 1;
      }
      if (window.azureStrikes > 0 || window.livingFlameCasts > 0) {
        windowFrequencies.fillers += 1;
      }
    });

    return windowFrequencies;
  }

  get averageCasts() {
    return 5;
    // const totalCounter = {
    //   disintegrates: 0,
    //   fireBreaths: 0,
    //   eternitySurges: 0,
    //   livingFlameProcs: 0,
    //   livingFlameCasts: 0,
    //   azureStrikes: 0,
    // };

    // const windows = Object.keys(this.counter).length;
    // Object.values(this.counter).forEach((window) => {
    //   totalCounter.disintegrates += window.disintegrates;
    //   totalCounter.fireBreaths += window.fireBreaths;
    //   totalCounter.eternitySurges += window.eternitySurges;
    //   totalCounter.livingFlameProcs += window.livingFlameProcs;
    //   totalCounter.livingFlameCasts += window.livingFlameCasts;
    //   totalCounter.azureStrikes += window.azureStrikes;
    // });

    // const averageCasts = Object.keys(totalCounter).reduce(
    //   (counter: { [key: string]: number }, key) => {
    //     counter[key] = Number(
    //       (totalCounter[key as keyof typeof totalCounter] / windows).toFixed(3),
    //     );
    //     return counter;
    //   },
    //   {},
    // );

    // const totalAverageCasts = Object.values(averageCasts).reduce((a, b) => a + Number(b), 0);

    // const percentages = Object.keys(totalCounter).reduce(
    //   (counter: { [key: string]: number }, key) => {
    //     counter[key] = Number(
    //       (
    //         (Number(averageCasts[key as keyof typeof averageCasts]) / totalAverageCasts) *
    //         100
    //       ).toFixed(2),
    //     );
    //     return counter;
    //   },
    //   {},
    // );

    // return {
    //   averageCasts,
    //   percentages,
    // };
  }
}

export default ShatteringStar;
