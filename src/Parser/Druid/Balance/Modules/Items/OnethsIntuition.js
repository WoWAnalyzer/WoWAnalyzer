import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';

class OnethsIntuition extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  freeStarsurgeProcs = 0;
  freeStarfallProcs = 0;
  freeStarsurgeProcsWasted = 0;
  freeStarfallProcsWasted = 0;
  starsurgeCasts = 0;
  starfallCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.ONETHS_INTUITION.id);
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ONETHS_INTUITION.id) {
      this.freeStarsurgeProcs += 1;
    }
    if (spellId === SPELLS.ONETHS_OVERCONFIDENCE.id) {
      this.freeStarfallProcs += 1;
    }
  }
  on_toPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ONETHS_INTUITION.id) {
      this.freeStarsurgeProcs += 1;
      this.freeStarsurgeProcsWasted += 1;
    }
    if (spellId === SPELLS.ONETHS_OVERCONFIDENCE.id) {
      this.freeStarfallProcs += 1;
      this.freeStarfallProcsWasted += 1;
    }
  }
  on_byPlayer_cast(event){
    const spellId = event.ability.guid;
    if(spellId === SPELLS.STARSURGE_MOONKIN.id) {
      this.starsurgeCasts++;
    }
    if(spellId === SPELLS.STARFALL.id) {
      this.starfallCasts++;
    }
  }

  get percentFreeStarsurgeProcs(){
    return this.freeStarsurgeProcs / this.starfallCasts;
  }

  get percentFreeStarfallProcs(){
    return this.freeStarfallProcs / this.starsurgeCasts;
  }

  item() {
    return {
      item: ITEMS.ONETHS_INTUITION,
      result: (
        <dfn data-tip={`
          <ul>
            <li>Free Starsurge procs gained: ${this.freeStarsurgeProcs} (${this.freeStarsurgeProcsWasted} wasted) from ${this.starfallCasts} Starfall casts (${this.percentFreeStarsurgeProcs}).</li>
            <li>Free Starfall procs gained: ${this.freeStarfallProcs} (${this.freeStarfallProcsWasted} wasted) from ${this.starsurgeCasts} Starsurge casts (${this.percentFreeStarfallProcs}).</li>
          </ul>
        `}>
          <Wrapper>{this.freeStarsurgeProcs} <SpellIcon id={SPELLS.ONETHS_INTUITION.id}/> {this.freeStarfallProcs} <SpellIcon id={SPELLS.ONETHS_OVERCONFIDENCE.id}/></Wrapper>
        </dfn>
      ),
    };
  }
}

export default OnethsIntuition;
