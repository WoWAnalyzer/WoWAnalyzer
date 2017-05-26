// Modified from Original Code by Blazyb and his Innervate module.

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

const baseMana = 1100000;

class ManaTea extends Module {
  manaSaved = 0;
  manateaCount = 0;

  effCasts = 0;
  enmCasts = 0;
  efCasts = 0;
  lcCasts = 0;
  remCasts = 0;
  revCasts = 0;
  vivCasts = 0;
  rjwCasts =0;

  nonManaCasts = 0;
  castsUnderManaTea = 0;

  hasLifeCycles = false;
  casted = false;

  on_initialized() {
    if(!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.MANA_TEA_TALENT.id);
      if (this.owner.selectedCombatant.hasTalent(SPELLS.LIFECYCLES_TALENT.id)) {
        this.hasLifeCycles = true;
      }
    }
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if(SPELLS.MANA_TEA_TALENT.id === spellId) {
      this.manateaCount++;
      debug && console.log('Mana Tea Cast +1. Total:' + this.manateaCount);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(this.owner.selectedCombatant.hasBuff(SPELLS.MANA_TEA_TALENT.id)) {

      debug && console.log('Mana Tea Buff present');
      if(SPELLS.EFFUSE.id === spellId) {
        this.addToManaSaved(SPELLS.EFFUSE.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.effCasts++;
        this.casted = true;
      }
      debug && console.log('Eff Check');
      if(SPELLS.ENVELOPING_MISTS.id === spellId) {
        this.addToManaSaved(SPELLS.ENVELOPING_MISTS.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.enmCasts++;
        this.casted = true;
      }
      debug && console.log('Enm Check');
      if(SPELLS.ESSENCE_FONT.id === spellId) {
        this.addToManaSaved(SPELLS.ESSENCE_FONT.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.efCasts++;
        this.casted = true;
      }
      debug && console.log('Ef Check');
      if(SPELLS.LIFE_COCOON.id === spellId) {
        this.addToManaSaved(SPELLS.LIFE_COCOON.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.lcCasts++;
        this.casted = true;
      }
      debug && console.log('LC Check');
      if(SPELLS.RENEWING_MIST.id === spellId) {
        this.addToManaSaved(SPELLS.RENEWING_MIST.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.remCasts++;
        this.casted = true;
      }
      debug && console.log('REM Check');
      if(SPELLS.REVIVAL.id === spellId) {
        this.addToManaSaved(SPELLS.REVIVAL.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.revCasts++;
        this.casted = true;
      }
      debug && console.log('Rev Check');
      if(SPELLS.VIVIFY.id === spellId) {
        this.addToManaSaved(SPELLS.VIVIFY.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.vivCasts++;
        this.casted = true;
      }
      debug && console.log('Viv Check');
      if(SPELLS.REFRESHING_JADE_WIND_TALENT.id === spellId) {
        this.addToManaSaved(SPELLS.REFRESHING_JADE_WIND_TALENT.manaPerc, spellId);
        this.castsUnderManaTea++;
        this.rjwCasts++;
        this.casted = true;
      }
      debug && console.log('RJW Check');
      // Capture any Non Mana casts during Mana Tea
      if(!this.casted) {
        this.nonManaCasts++;
        this.casted = false;
      }


    }
  }

  addToManaSaved(spellBaseMana, spellId) {
    // Lifecycles reduces the mana cost of both Vivify and Enveloping Mists.  We must take that into account when calculating mana saved.
    if(this.hasLifeCycles) {
      if(this.owner.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_VIVIFY_BUFF.id) && spellId === SPELLS.VIVIFY.id) {
        this.manaSaved += ((baseMana * spellBaseMana) * (1 - (SPELLS.LIFECYCLES_VIVIFY_BUFF.manaPercRed)))
        debug && console.log('LC Viv Cast')
      } else if((this.owner.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id) && spellId === SPELLS.ENVELOPING_MISTS.id)) {
        this.manaSaved += ((baseMana * spellBaseMana) * (1 - (SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.manaPercRed)))
      } else {
        this.manasaved += (baseMana * spellBaseMana)
      }
      // If we cast TFT -> Viv, mana cost of Viv is 0
    } else if(this.owner.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id) && SPELLS.VIVIFY.id === spellId) {
        this.nonManaCasts++;
    } else {
      this.manaSaved += (baseMana * spellBaseMana);
    }
  }
  on_finished() {
    if(debug) {
      console.log("Mana Tea Casted: " + this.manateaCount);
      console.log("Mana saved: " + this.manaSaved);
      console.log("Avg. Mana saved: " + (this.manaSaved/this.manateaCount));
      console.log("Total Casts under Mana Tea: " + this.castsUnderManaTea);
      console.log("Avg Casts under Mana Tea: " + (this.castsUnderManaTea/this.manateaCount));
      console.log("Free spells cast: " + this.nonManaCasts);
    }
  }
}

export default ManaTea;
