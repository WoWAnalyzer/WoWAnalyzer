import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import HIT_TYPES from 'parser/core/HIT_TYPES';
import SpellUsable from 'parser/core/modules/SpellUsable';

const COMBUST_REDUCTION_SPELLS = [
  SPELLS.FIREBALL.id,
  SPELLS.PYROBLAST.id,
  SPELLS.FIRE_BLAST.id,
];

const CRIT_REDUCTION_MS = 1000;

class Kindling extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  cooldownReduction = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.KINDLING_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!COMBUST_REDUCTION_SPELLS.includes(spellId) || event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.COMBUSTION.id)) {
      this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.COMBUSTION.id, (CRIT_REDUCTION_MS));
    }
  }
}

export default Kindling;
