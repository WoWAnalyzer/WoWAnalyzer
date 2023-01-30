import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { qualitativePerformanceToColor } from 'interface/guide';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Item } from 'parser/ui/DonutChart';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

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
  PYRE,
  PYRE_DENSE_TALENT,
} = SPELLS;

const { DRAGONRAGE_TALENT } = TALENTS_EVOKER;

type DamageCounter = {
  disintegrate: number;
  pyre: number;
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

  windowEntries: BoxRowEntry[] = [];

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
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([
          DISINTEGRATE,
          FIRE_BREATH,
          FIRE_BREATH_FONT,
          ETERNITY_SURGE,
          ETERNITY_SURGE_FONT,
          LIVING_FLAME_DAMAGE,
          LIVING_FLAME_CAST,
          AZURE_STRIKE,
          PYRE,
          PYRE_DENSE_TALENT,
        ]),
      this.onCast,
    );
  }

  onApply() {
    this.totalCasts += 1;
    this.isBuffOn = true;
    this.damageCounters[this.totalCasts] = {
      disintegrate: 0,
      pyre: 0,
      fireBreath: 0,
      eternitySurge: 0,
      livingFlame: 0,
      azureStrike: 0,
    };
  }

  get currentDamageCounter() {
    return this.damageCounters[this.totalCasts];
  }

  onRemove() {
    this.isBuffOn = false;

    const goodSpells =
      this.currentDamageCounter.disintegrate +
      this.currentDamageCounter.pyre +
      this.currentDamageCounter.eternitySurge;

    let performance = QualitativePerformance.Fail;
    if (goodSpells >= 2) {
      performance = QualitativePerformance.Perfect;
    } else if (goodSpells === 1) {
      performance = QualitativePerformance.Good;
    }

    this.windowEntries.push({
      value: performance,
      tooltip: (
        <div>
          {this.inDragonRageWindow && (
            <div>
              <strong>Dragonrage Active</strong>
            </div>
          )}
          <div>Disintegrate: {this.currentDamageCounter.disintegrate}</div>
          <div>Pyre: {this.currentDamageCounter.pyre}</div>
          <div>Eternity Surge: {this.currentDamageCounter.eternitySurge}</div>
          <div>Fire Breath: {this.currentDamageCounter.fireBreath}</div>
          <div>Living Flame: {this.currentDamageCounter.livingFlame}</div>
          <div>Azure Strike: {this.currentDamageCounter.azureStrike}</div>
        </div>
      ),
    });
  }

  onCast(castEvent: CastEvent) {
    if (!this.isBuffOn) {
      return;
    }

    const currentWindow = this.currentDamageCounter;

    switch (castEvent.ability.guid) {
      case PYRE.id:
      case PYRE_DENSE_TALENT.id:
        currentWindow.pyre += 1;
        break;
      case DISINTEGRATE.id:
        currentWindow.disintegrate += 1;
        break;
      case FIRE_BREATH.id:
      case FIRE_BREATH_FONT.id:
        currentWindow.fireBreath += 1;
        break;
      case ETERNITY_SURGE.id:
      case ETERNITY_SURGE_FONT.id:
        currentWindow.eternitySurge += 1;
        break;
      case LIVING_FLAME_CAST.id:
      case LIVING_FLAME_DAMAGE.id:
        currentWindow.livingFlame += 1;
        break;
      case AZURE_STRIKE.id:
        currentWindow.azureStrike += 1;
        break;
      default:
        break;
    }
  }

  get donutItems(): Item[] {
    const perfect = this.windowEntries.filter(
      (entry) => entry.value === QualitativePerformance.Perfect,
    ).length;
    const good = this.windowEntries.filter((entry) => entry.value === QualitativePerformance.Good)
      .length;
    const fail = this.windowEntries.filter((entry) => entry.value === QualitativePerformance.Fail)
      .length;

    return [
      {
        label: '2+ Powerful Spells',
        value: perfect,
        color: qualitativePerformanceToColor(QualitativePerformance.Perfect),
      },
      {
        label: '1 Powerful Spell',
        value: good,
        color: qualitativePerformanceToColor(QualitativePerformance.Good),
      },
      {
        label: '0 Powerful Spells',
        value: fail,
        color: qualitativePerformanceToColor(QualitativePerformance.Fail),
      },
    ];
  }
}

export default ShatteringStar;
