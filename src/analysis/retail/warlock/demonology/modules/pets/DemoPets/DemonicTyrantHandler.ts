import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent } from 'parser/core/Events';

import { isWildImp } from '../helpers';
import PETS from '../PETS';
import DemoPets from './index';

const test = false;

class DemonicTyrantHandler extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  demoPets!: DemoPets;
  _lastCast: number | null;

  constructor(options: Options) {
    super(options);
    this._lastCast = null;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SUMMON_DEMONIC_TYRANT),
      this.onDemonicTyrantCast,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.DEMONIC_POWER),
      this.onDemonicPowerRemove,
    );
  }

  onDemonicTyrantCast(event: CastEvent) {
    // extend current pets by 15 seconds
    this._lastCast = event.timestamp;
    const affectedPets = this.demoPets.currentPets;
    test &&
      this.log('Demonic Tyrant cast, affected pets: ', JSON.parse(JSON.stringify(affectedPets)));
    affectedPets.forEach((pet) => {
      pet.extend();
      pet.pushHistory(event.timestamp, 'Extended with Demonic Tyrant', event);
    });
    test &&
      this.log(
        'Pets after Demonic Tyrant cast',
        JSON.parse(JSON.stringify(this.demoPets.currentPets)),
      );
  }

  onDemonicPowerRemove(event: RemoveBuffEvent) {
    // Demonic Tyrant effect faded, update imps' expected despawn
    const actualBuffTime = event.timestamp - (this._lastCast || 0);
    this.demoPets.currentPets
      .filter((pet) => isWildImp(pet.guid))
      .forEach((imp) => {
        // original duration = spawn + 15
        // extended duration on DT cast = (spawn + 15) + 15
        // real duration = (spawn + 15) + actualBuffTime
        imp.expectedDespawn = imp.spawn + PETS.WILD_IMP_HOG.duration + actualBuffTime;
        imp.pushHistory(event.timestamp, 'Updated expected despawn for imp', event);
      });
  }
}

export default DemonicTyrantHandler;
