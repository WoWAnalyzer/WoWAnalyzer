import { CastEvent, DamageEvent } from 'parser/core/Events';
import Enemy from 'parser/core/Enemy';

class FlurryEvent {
  cast: CastEvent;
  damage: DamageEvent | undefined;
  enemy: Enemy | null | undefined;
  brainFreeze: boolean;
  thermalVoid: boolean;

  constructor(
    cast: CastEvent,
    damage: DamageEvent | undefined,
    enemy: Enemy | null | undefined,
    brainFreeze: boolean,
    thermalVoid: boolean,
  ) {
    this.cast = cast;
    this.damage = damage;
    this.enemy = enemy;
    this.brainFreeze = brainFreeze;
    this.thermalVoid = thermalVoid;
  }
}

export default FlurryEvent;
