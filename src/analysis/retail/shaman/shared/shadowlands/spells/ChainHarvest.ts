import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { DamageEvent, HealEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

// const cooldownDecrease = 5000;

/**
 * CD is reduced by crits
 */

class ChainHarvest extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = false;

    // this.addEventListener(
    //   Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HARVEST_HEAL),
    //   this.reduceCooldownOnCriticalHit,
    // );
    //
    // this.addEventListener(
    //   Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_HARVEST_DAMAGE),
    //   this.reduceCooldownOnCriticalHit,
    // );
  }

  reduceCooldownOnCriticalHit(event: HealEvent | DamageEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    // if (this.spellUsable.isOnCooldown(SPELLS.CHAIN_HARVEST.id)) {
    //   this.spellUsable.reduceCooldown(SPELLS.CHAIN_HARVEST.id, cooldownDecrease);
    // }
  }
}

export default ChainHarvest;
