import Analyzer from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';

import SPELLS from 'common/SPELLS';

import DemoPets from './index';
import { DESPAWN_REASONS, META_CLASSES, META_TOOLTIPS } from '../TimelinePet';

const test = false;
const debug = false;

class ImplosionHandler extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  _lastImplosionCast = null;
  _implosionTargetsHit = [];

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.IMPLOSION_CAST.id) {
      return;
    }
    // Mark current Wild Imps as "implodable"
    const imps = this.demoPets.currentPets.filter(pet => this.demoPets._wildImpIds.includes(pet.id));
    test && this.log('Implosion cast, current imps', JSON.parse(JSON.stringify(imps)));
    if (imps.some(imp => imp.x === null || imp.y === null)) {
      debug && this.error('Implosion cast, some imps don\'t have coordinates', imps);
      return;
    }
    imps.forEach(imp => {
      imp.shouldImplode = true;
      imp.pushHistory(event.timestamp, 'Marked for implosion', event);
    });
    this._lastImplosionCast = event.timestamp;
    this._implosionTargetsHit = [];
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.IMPLOSION_DAMAGE.id) {
      return;
    }
    if (!event.x || !event.y) {
      debug && this.error('Implosion damage event doesn\'t have a target position', event);
      return;
    }
    // Pairing damage events with Imploded Wild Imps
    // First target hit kills an imp and marks the target
    // Consequent target hits just mark the target (part of the same AOE explosion)
    // Next hit on already marked target means new imp explosion
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (this._implosionTargetsHit.length === 0) {
      test && this.log(`First Implosion damage after cast on ${target}`);
    }
    else if (this._implosionTargetsHit.includes(target)) {
      test && this.log(`Implosion damage on ${target}, already marked => new imp exploded, reset array, marked`);
    }
    else if (this._implosionTargetsHit.length > 0 && !this._implosionTargetsHit.includes(target)) {
      this._implosionTargetsHit.push(target);
      test && this.log(`Implosion damage on ${target}, not hit yet, marked, skipped`);
      return;
    }
    this._implosionTargetsHit = [target];

    // handle Implosion
    // Implosion pulls all Wild Imps towards target, exploding them and dealing AoE damage
    // there's no connection of each damage event to individual Wild Imp, so take Imps that were present at the Implosion cast, order them by the distance from the target and kill them in this order (they should be travelling with the same speed)
    const imps = this.demoPets._getPets(this._lastImplosionCast) // there's a delay between cast and damage events, might be possible to generate another imps, those shouldn't count, that's why I use Implosion cast timestamp instead of current pets
      .filter(pet => this.demoPets._wildImpIds.includes(pet.id) && pet.shouldImplode && !pet.realDespawn)
      .sort((imp1, imp2) => {
        const distance1 = this._getDistance(imp1.x, imp1.y, event.x, event.y);
        const distance2 = this._getDistance(imp2.x, imp2.y, event.x, event.y);
        return distance1 - distance2;
      });
    test && this.log('Implosion damage, Imps to be imploded: ', JSON.parse(JSON.stringify(imps)));
    if (imps.length === 0) {
      debug && this.error('Error during calculating Implosion distance for imps');
      if (!this.demoPets._getPets(this._lastImplosionCast).some(pet => this.demoPets._wildImpIds.includes(pet.id))) {
        debug && this.error('No imps');
        return;
      }
      if (!this.demoPets._getPets(this._lastImplosionCast).some(pet => this.demoPets._wildImpIds.includes(pet.id) && pet.shouldImplode)) {
        debug && this.error('No implodable imps');
      }
      return;
    }
    imps[0].despawn(event.timestamp, DESPAWN_REASONS.IMPLOSION);
    imps[0].setMeta(META_CLASSES.DESTROYED, META_TOOLTIPS.IMPLODED);
    imps[0].pushHistory(event.timestamp, 'Killed by Implosion', event);
  }

  _getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }
}

export default ImplosionHandler;
