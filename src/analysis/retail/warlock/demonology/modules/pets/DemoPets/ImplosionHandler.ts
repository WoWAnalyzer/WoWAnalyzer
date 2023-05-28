import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

import { isWildImp } from '../helpers';
import { DESPAWN_REASONS, META_CLASSES, META_TOOLTIPS } from '../TimelinePet';
import DemoPets from './index';

const test = false;
const debug = false;

class ImplosionHandler extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
  };

  demoPets!: DemoPets;
  _lastCast: number | null;
  _targetsHit!: string[];

  constructor(options: Options) {
    super(options);
    this._lastCast = null;
    this._targetsHit = [];
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IMPLOSION_CAST),
      this.onImplosionCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.IMPLOSION_DAMAGE),
      this.onImplosionDamage,
    );
  }

  onImplosionCast(event: CastEvent) {
    // Mark current Wild Imps as "implodable"
    const imps = this.demoPets.currentPets.filter((pet) => isWildImp(pet.guid));
    test && this.log('Implosion cast, current imps', JSON.parse(JSON.stringify(imps)));
    if (imps.some((imp) => imp.x === null || imp.y === null)) {
      debug && this.error("Implosion cast, some imps don't have coordinates", imps);
      return;
    }
    imps.forEach((imp) => {
      imp.shouldImplode = true;
      imp.pushHistory(event.timestamp, 'Marked for implosion', event);
    });
    this._lastCast = event.timestamp;
    this._targetsHit = [];
  }

  onImplosionDamage(event: DamageEvent) {
    if (!event.x || !event.y) {
      debug && this.error("Implosion damage event doesn't have a target position", event);
      return;
    }
    // Pairing damage events with Imploded Wild Imps
    // First target hit kills an imp and marks the target
    // Consequent target hits just mark the target (part of the same AOE explosion)
    // Next hit on already marked target means new imp explosion
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (this._targetsHit.length === 0) {
      test && this.log(`First Implosion damage after cast on ${target}`);
    } else if (this._targetsHit.includes(target)) {
      test &&
        this.log(
          `Implosion damage on ${target}, already marked => new imp exploded, reset array, marked`,
        );
    } else if (this._targetsHit.length > 0 && !this._targetsHit.includes(target)) {
      this._targetsHit.push(target);
      test && this.log(`Implosion damage on ${target}, not hit yet, marked, skipped`);
      return;
    }
    this._targetsHit = [target];

    // handle Implosion
    // Implosion pulls all Wild Imps towards target, exploding them and dealing AoE damage
    // there's no connection of each damage event to individual Wild Imp, so take Imps that were present at the Implosion cast, order them by the distance from the target and kill them in this order (they should be travelling with the same speed)
    const imps = this.demoPets
      ._getPets(this._lastCast ?? undefined) // there's a delay between cast and damage events, might be possible to generate another imps, those shouldn't count, that's why I use Implosion cast timestamp instead of current pets
      .filter((pet) => isWildImp(pet.guid) && pet.shouldImplode && !pet.realDespawn)
      // TODO: might want to make this eaiser by making `_getPets` return (TimelinePet | WildImp)[]
      .sort((imp1, imp2) => {
        // no clue why this isn't pickup up the `if` check at the start of this function...
        const distance1 = this._getDistance(
          imp1.x ?? 0,
          imp1.y ?? 0,
          event.x as number,
          event.y as number,
        );
        const distance2 = this._getDistance(
          imp2.x ?? 0,
          imp2.y ?? 0,
          event.x as number,
          event.y as number,
        );
        return distance1 - distance2;
      });
    test && this.log('Implosion damage, Imps to be imploded: ', JSON.parse(JSON.stringify(imps)));
    if (imps.length === 0) {
      debug && this.error('Error during calculating Implosion distance for imps');
      if (!this.demoPets._getPets(this._lastCast ?? undefined).some((pet) => isWildImp(pet.guid))) {
        debug && this.error('No imps');
        return;
      }
      if (
        !this.demoPets
          ._getPets(this._lastCast ?? undefined)
          .some((pet) => isWildImp(pet.guid) && pet.shouldImplode)
      ) {
        debug && this.error('No implodable imps');
      }
      return;
    }
    imps[0].despawn(event.timestamp, DESPAWN_REASONS.IMPLOSION);
    imps[0].setMeta(META_CLASSES.DESTROYED, META_TOOLTIPS.IMPLODED);
    imps[0].pushHistory(event.timestamp, 'Killed by Implosion', event);
  }

  _getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }
}

export default ImplosionHandler;
