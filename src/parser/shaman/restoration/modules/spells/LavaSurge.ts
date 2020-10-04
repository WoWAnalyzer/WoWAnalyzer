import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { ApplyBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Abilities from '../Abilities';


class LavaSurge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  on_applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LAVA_SURGE.id) {
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.LAVA_BURST.id)) {
      const reduction = this.abilities.getExpectedCooldownDuration(SPELLS.LAVA_BURST.id, this.spellUsable.cooldownTriggerEvent(SPELLS.LAVA_BURST.id))
      if (reduction) {
        this.spellUsable.reduceCooldown(SPELLS.LAVA_BURST.id, reduction);
      }
    }
  }
}

export default LavaSurge;
