import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Abilities from 'Parser/Core/Modules/Abilities';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

/**
 * A quick shot causing Physical damage.
 * Reduces the cooldown of Kill Command by 1 sec.
 */

const COOLDOWN_REDUCTION_MS = 1000;

class CobraShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  effectiveKCReductionMs = 0;
  wastedKCReductionMs = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.COBRA_SHOT.id) {
      return;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.KILL_COMMAND.id)) {
      this.wastedKCReductionMs += COOLDOWN_REDUCTION_MS;
      return;
    }
    const effectiveReductionMs = this.spellUsable.reduceCooldown(SPELLS.KILL_COMMAND.id, COOLDOWN_REDUCTION_MS);
    this.effectiveKCReductionMs += effectiveReductionMs;
    this.wastedKCReductionMs += (COOLDOWN_REDUCTION_MS - effectiveReductionMs);
  }
}

export default CobraShot;
