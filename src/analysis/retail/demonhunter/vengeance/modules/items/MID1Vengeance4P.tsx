import SPELLS from 'common/SPELLS/demonhunter';
//import TALENTS, { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
//import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
//import { TIERS } from 'game/TIERS';

/**
 * (4) Set Vengeance: Fracture has a 30% chance to spark a violent detonation, causing (200% of Attack Power) Fire damage onto nearby enemies.
 *                    Damage reduced beyond 5 targets.
 */

class MID1Vengeance4P extends Analyzer {
  private procTimestamps: number[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MID1_VIOLENT_DETONATION),
      this.onDetonationEvent,
    );

    // If its a cast:
    // this.addEventListener
    //   Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MID1_VIOLENT_DETONATION),
    //   this.onDetonationCast,
    // );
    // Should damage calculation go in this class? I feel like it belongs to a normalizer class
  }

  private onDetonationEvent = (event: DamageEvent) => {
    this.procTimestamps.push(event.timestamp);
  };

  // Again if its a cast:
  private onDetonationCast = (event: CastEvent) => {
    this.procTimestamps.push(event.timestamp);
  };

  get procCount() {
    return this.procTimestamps.length;
  }
}

export default MID1Vengeance4P;
