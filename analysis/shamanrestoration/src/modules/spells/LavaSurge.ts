import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import Abilities from '../Abilities';

class LavaSurge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LAVA_SURGE),
      this.onLavaSurgeProc,
    );
  }

  onLavaSurgeProc() {
    if (this.spellUsable.isOnCooldown(SPELLS.LAVA_BURST.id)) {
      this.spellUsable.endCooldown(SPELLS.LAVA_BURST.id, undefined, true);
    }
  }
}

export default LavaSurge;
