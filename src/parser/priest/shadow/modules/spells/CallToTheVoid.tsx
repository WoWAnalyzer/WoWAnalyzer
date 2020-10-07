import PETS from 'common/PETS';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Pet from '../core/Pet';
import { CALL_TO_THE_VOID_INSANITY_GEN_PER_TICK } from '../../constants';

class CallToTheVoid extends Pet {
  _pet = PETS.VOID_TENDRIL;
  _generatedInsanity = 0;
  _tentacles = {};

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (this._sourceId !== undefined && event.sourceID === this._sourceId) {
      this._generatedInsanity += CALL_TO_THE_VOID_INSANITY_GEN_PER_TICK;
    }

    super.onPetDamage(event);
  }

  get insanityGenerated() {
    return this._generatedInsanity;
  }

  get insanityGeneratedPerSecond() {
    return this.insanityGenerated / (this.owner.fightDuration / 1000);
  }
}

export default CallToTheVoid;
