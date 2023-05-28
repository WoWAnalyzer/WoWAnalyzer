import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { TALENTS_SHAMAN } from 'common/TALENTS';

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

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT),
      this.onDamage,
    );
  }

  onDamage() {
    if (this.spellUsable.isOnCooldown(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id)) {
      this.spellUsable.reduceCooldown(
        TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id,
        CRASH_LIGHTNING_REDUCTION,
      );
    }
  }
}

export default ChainLightning;
