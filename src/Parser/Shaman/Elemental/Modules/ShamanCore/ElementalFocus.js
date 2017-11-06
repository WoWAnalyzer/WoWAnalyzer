import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';

class ElementalFocus extends Analyzer {
  stack = 0;
  wastedStacks = 0; // TODO: make sure that this value is accurate
  hasBuff = false;
  spellsCast = {};

  relevantCastIds = [
    SPELLS.FLAME_SHOCK.id,
    SPELLS.LAVA_BURST.id,
    SPELLS.EARTH_SHOCK.id,
    SPELLS.FROST_SHOCK.id,
    SPELLS.ELEMENTAL_BLAST_TALENT.id,
    SPELLS.LIGHTNING_BOLT.id,
    SPELLS.CHAIN_LIGHTNING.id,
    SPELLS.EARTHQUAKE.id,
    SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id,
  ];

  on_initialized() {
    this.active = true;
  }

  on_toPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.ELEMENTAL_FOCUS.id) {
      this.stack = 2;
      this.hasBuff = true;
    }
  }

  on_toPlayer_refreshbuff(event) {
    if (event.ability.guid === SPELLS.ELEMENTAL_FOCUS.id) {
      this.wastedStacks += this.stack;
      this.stack = 2;
    }
  }

  on_toPlayer_removedebuff(event) {
    if (event.ability.guid === SPELLS.ELEMENTAL_FOCUS.id) {
      this.wastedStacks += this.stack;
      this.stack = 0;
      this.hasBuff = false;
    }
  }

  on_byPlayer_cast(event) {
    if (this.relevantCastIds.some(cast_id => event.ability.guid === cast_id)) {
      const id = event.ability.guid;
      if (!this.spellsCast[id]) {
        this.spellsCast[id] = {buffed: 0, unbuffed: 0, total: 0};
      }
      if (this.hasBuff) {
        this.spellsCast[id].buffed++;
      } else {
        this.spellsCast[id].unbuffed++;
      }
      this.spellsCast[id].total++;
      this.stack--;
    }
  }
}

export default ElementalFocus;
