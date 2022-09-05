import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const CRASH_LIGHTNING_REDUCTION = 1000;

/**
 * Hurls a lightning bolt at the enemy, dealing (63.5% of Spell power) Nature damage and then jumping to additional nearby enemies. Affects 3 total targets.
 *
 *  Enhancement (Level 38)
 * If Chain Lightning hits more than 1 target, each target hit by your Chain Lightning increases the damage of your next Crash Lightning by 20%
 *
 *  Enhancement (Level 52)
 * Each target hit by Chain Lightning reduces the cooldown of Crash Lightning by 1.0 sec
 */
class ChainLightning extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CHAIN_LIGHTNING),
      this.onDamage,
    );
  }

  onDamage() {
    if (this.spellUsable.isOnCooldown(SPELLS.CRASH_LIGHTNING.id)) {
      this.spellUsable.reduceCooldown(SPELLS.CRASH_LIGHTNING.id, CRASH_LIGHTNING_REDUCTION);
    }
  }
}

export default ChainLightning;
