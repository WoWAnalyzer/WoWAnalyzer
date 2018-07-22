import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const COOLDOWN_REDUCTION_MS = 25000;

class RadiantMoonlight extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  halfMoonCasted = true;
  freeFullMoons = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBack(ITEMS.RADIANT_MOONLIGHT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.HALF_MOON.id) {
      this.halfMoonCasted = true;
    }
    if (!this.halfMoonCasted || event.ability.guid !== SPELLS.FULL_MOON.id) {
      return;
    }
    this.halfMoonCasted = false;
    this.freeFullMoons += 1;
    if (!this.spellUsable.isOnCooldown(SPELLS.NEW_MOON_TALENT.id)) {
      return;
    }
    this.spellUsable.reduceCooldown(SPELLS.NEW_MOON_TALENT.id, COOLDOWN_REDUCTION_MS);
  }

  item() {
    return {
      item: ITEMS.RADIANT_MOONLIGHT,
      result: <React.Fragment>Gave you {formatNumber(this.freeFullMoons)} free <SpellLink id={SPELLS.FULL_MOON.id} /> casts</React.Fragment>,
    };
  }
}

export default RadiantMoonlight;
