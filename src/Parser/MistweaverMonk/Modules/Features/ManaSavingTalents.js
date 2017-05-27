import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

const baseMana = 1100000;

class ManaSavingTalents extends Module {
  manaSaved = 0;
  manaSavedViv = 0;
  manaSavedEnm = 0;
  castsRedEnm = 0;
  castsRedViv = 0;
  castsNonRedViv = 0;
  castsNonRedEnm = 0;

  manaReturnSotc = 0;

  castsTp = 0;
  buffTotm = 0;
  castsBk = 0;

  hasLifeCycles = false;
  hasSotc = false;



  on_initialized() {
    if(!this.owner.error) {
      if(this.owner.selectedCombatant.hasTalent(SPELLS.LIFECYCLES_TALENT.id)) {
        this.hasLifeCycles = true;
      }
      if(this.owner.selectedCombatant.hasTalent(SPELLS.SPIRIT_OF_THE_CRANE_TALENT.id)) {
        this.hasSotc = true;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(this.owner.selectedCombatant.hasBuff(SPELLS.TEACHINGS_OF_THE_MONASTERY.id)) {
      this.buffTotm++;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(this.hasLifeCycles) {
      // Checking to ensure player has cast Vivify and has the mana reduction buff.
      if(spellId === SPELLS.VIVIFY.id && this.owner.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_VIVIFY_BUFF.id)) {
        this.manaSaved += (baseMana * SPELLS.VIVIFY.manaPerc) * (SPELLS.LIFECYCLES_VIVIFY_BUFF.manaPercRed)
        this.manaSavedViv += (baseMana * SPELLS.VIVIFY.manaPerc) * (SPELLS.LIFECYCLES_VIVIFY_BUFF.manaPercRed)
        this.castsRedViv++;
        debug && console.log('Viv Reduced')
      }
      if(spellId === SPELLS.VIVIFY.id && !this.owner.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_VIVIFY_BUFF.id)) {
        this.castsNonRedViv++;
      }
      // Checking to ensure player has cast Enveloping Mists and has the mana reduction buff
      if(spellId === SPELLS.ENVELOPING_MISTS.id && this.owner.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id)) {
        this.manaSaved += (baseMana * SPELLS.ENVELOPING_MISTS.manaPerc) * (SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.manaPercRed)
        this.manaSavedEnm += (baseMana * SPELLS.ENVELOPING_MISTS.manaPerc) * (SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.manaPercRed)
        this.castsRedEnm++;
        debug && console.log('ENM Reduced')
      }
      if(spellId === SPELLS.ENVELOPING_MISTS.id && !this.owner.selectedCombatant.hasBuff(SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF.id)) {
        this.castsNonRedEnm++;
      }
    }

    if(debug) {
      if(spellId === SPELLS.TIGER_PALM.id) {
        this.castsTp++;
      }
      if(spellId === SPELLS.BLACKOUT_KICK.id) {
        this.castsBk++;
      }
    }


    if(this.hasSotc) {


    }


  }


  on_finished() {
    if(debug) {
      console.log("Mana Reduced:" + this.manaSaved);
      console.log("Viv Mana Reduced:" + this.manaSavedViv);
      console.log("EnM Mana Reduced:" + this.manaSavedEnm);
      console.log("Tiger Palm Casts:" + this.castsTp);
      console.log("Teachings Buffs:" + this.buffTotm);
      console.log("Blackout Kick casts:" + this.castsBk);
    }
  }
}

export default ManaSavingTalents;
