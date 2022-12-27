import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';

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

type DamageCounter = {
  disintegrate: number;
  fireBreath: number;
  eternitySurge: number;
  livingFlame: number;
  azureStrike: number;
};

class ShatteringStar extends Analyzer {
  totalBreaths: number = 0;
  totalApplications: number = 0;
  totalCasts: number = 0;
  isBuffOn: boolean = false;
  inDragonRageWindow: boolean = false;
  damageCounters: {
    [window: number]: DamageCounter;
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
      Events.removedebuff.by(SELECTED_PLAYER).spell([SHATTERING_STAR]),
      this.onRemove,
    );

    this.addEventListener(
      Events.damage
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
      this.onDamage,
    );
  }

  onApply() {
    if (this.inDragonRageWindow) {
      return;
    }

    this.totalCasts += 1;
    this.isBuffOn = true;
    this.damageCounters[this.totalCasts] = {
      disintegrate: 0,
      fireBreath: 0,
      eternitySurge: 0,
      livingFlame: 0,
      azureStrike: 0,
    };
  }

  onRemove() {
    this.isBuffOn = false;
  }

  onDamage(damageEvent: DamageEvent) {
    if (!this.isBuffOn) {
      return;
    }

    const currentWindow = this.damageCounters[this.totalCasts];

    switch (damageEvent.ability.guid) {
      case DISINTEGRATE.id:
        currentWindow.disintegrate += damageEvent.amount;
        break;
      case FIRE_BREATH.id:
      case FIRE_BREATH_FONT.id:
        currentWindow.fireBreath += damageEvent.amount;
        break;
      case ETERNITY_SURGE.id:
      case ETERNITY_SURGE_FONT.id:
        currentWindow.eternitySurge += damageEvent.amount;
        break;
      case LIVING_FLAME_CAST.id:
      case LIVING_FLAME_DAMAGE.id:
        currentWindow.livingFlame += damageEvent.amount;
        break;
      case AZURE_STRIKE.id:
        currentWindow.azureStrike += damageEvent.amount;
        break;
      default:
        break;
    }
  }
}

export default ShatteringStar;
