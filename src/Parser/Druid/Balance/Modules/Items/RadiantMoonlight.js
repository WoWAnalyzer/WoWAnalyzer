import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const COOLDOWN_REDUCTION_MS = 30000;

class RadiantMoonlight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  halfMoonCasted = true;
  freeFullMoons = 0;
  cooldownReduction = 0;
  cooldownReductionWasted = 0;
  newMoonCasts = 0;
  halfMoonCasts = 0;
  fullMoonCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBack(ITEMS.RADIANT_MOONLIGHT.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.HALF_MOON.id) {
      this.halfMoonCasted = true;
      this.halfMoonCasts++;
    }
    if (event.ability.guid === SPELLS.NEW_MOON.id) {
      this.newMoonCasts++;
    }
    if (event.ability.guid === SPELLS.FULL_MOON.id) {
      this.fullMoonCasts++;
    }
    if (!this.halfMoonCasted || event.ability.guid !== SPELLS.FULL_MOON.id) {
      return;
    }
    this.halfMoonCasted = false;
    this.freeFullMoons++;
    if(!this.spellUsable.isOnCooldown(SPELLS.NEW_MOON.id)){
      return;
    }
    const reduction = this.spellUsable.reduceCooldown(SPELLS.NEW_MOON.id, COOLDOWN_REDUCTION_MS);
    this.cooldownReductionWasted = COOLDOWN_REDUCTION_MS - reduction;
    this.cooldownReduction += reduction;   
  }

  get cooldownReductionOnRest(){
    return (this.cooldownReduction - this.freeFullMoons * COOLDOWN_REDUCTION_MS / 2) / 1000;
  }

  get nonFreeMoonCasts(){
    return this.newMoonCasts + this.halfMoonCasts + this.fullMoonCasts - this.freeFullMoons;
  }

  get averageCooldownReduction(){
    return this.cooldownReductionOnRest / this.nonFreeMoonCasts;
  }

  item() {
    return {
      item: ITEMS.RADIANT_MOONLIGHT,
      result: <React.Fragment>Gave you {formatNumber(this.freeFullMoons)} free <SpellLink id={SPELLS.FULL_MOON.id} /> casts and reduced the cooldown of your Moon spells by an average of ~{this.averageCooldownReduction.toFixed(1)} seconds.</React.Fragment>,
    };
  }
}

export default RadiantMoonlight;
