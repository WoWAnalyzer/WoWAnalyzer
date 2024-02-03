import { CastEvent, DamageEvent } from 'parser/core/Events';
import Enemy from 'parser/core/Enemy';
import SPELLS from 'common/SPELLS';

class FlurryEvent {
  cast: CastEvent;
  damage: DamageEvent | undefined;
  enemy: Enemy | null | undefined;
  overlapped: boolean;
  icicles: number;
  brainFreeze: boolean;

  constructor(
    cast: CastEvent,
    damage: DamageEvent | undefined,
    enemy: Enemy | null | undefined,
    icicles: number,
    brainFreeze: boolean,
  ) {
    this.cast = cast;
    this.damage = damage;
    this.enemy = enemy;
    this.overlapped = enemy?.hasBuff(SPELLS.WINTERS_CHILL.id, cast.timestamp - 10) || false;
    this.icicles = icicles;
    this.brainFreeze = brainFreeze;
  }

  noBfGoodCast(): boolean {
    return !this.brainFreeze && this.icicles >= 2;
  }

  noBfBadCast(): boolean {
    return !this.brainFreeze && this.icicles < 2;
  }
}

export default FlurryEvent;
