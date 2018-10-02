import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/core/modules/SpellUsable';
import Abilities from '../Abilities';


class LavaSurge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  on_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LAVA_SURGE.id) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.LAVA_BURST.id)) {
      this.spellUsable.reduceCooldown(SPELLS.LAVA_BURST.id, this.abilities.getExpectedCooldownDuration(SPELLS.LAVA_BURST.id));
    }
  }
}

export default LavaSurge;
