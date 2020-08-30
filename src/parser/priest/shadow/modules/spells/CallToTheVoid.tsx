import PETS from 'common/PETS';
import { DamageEvent } from 'parser/core/Events';
import Pet from '../core/Pet';



const INSANITY_GENERATED_EACH_TICK = 3;

class CallToTheVoid extends Pet {
  _pet = PETS.VOID_TENDRIL;
  _generatedInsanity = 0;
  _tentacles = {};

  on_damage(event: DamageEvent) {
    if (this._sourceId !== undefined && event.sourceID === this._sourceId) {
      this._generatedInsanity += INSANITY_GENERATED_EACH_TICK;
    }

    super.on_damage(event);
  }

  get insanityGenerated() {
    return this._generatedInsanity;
  }

  get insanityGeneratedPerSecond() {
    return this.insanityGenerated / (this.owner.fightDuration / 1000);
  }
}

export default CallToTheVoid;
