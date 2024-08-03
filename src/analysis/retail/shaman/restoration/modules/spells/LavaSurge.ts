import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
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
    if (this.spellUsable.isOnCooldown(TALENTS.LAVA_BURST_TALENT.id)) {
      this.spellUsable.endCooldown(TALENTS.LAVA_BURST_TALENT.id, undefined, true);
    }
  }
}

export default LavaSurge;
