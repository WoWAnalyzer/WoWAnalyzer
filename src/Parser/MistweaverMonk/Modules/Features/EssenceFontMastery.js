import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

class EssenceFontMastery extends Module {
  healEF = 0;
  healingEF = 0;
  overhealingEF = 0;
  absorbedhealingEF = 0;
  castStartEF = null;

  castEF = 0;
  targetsEF = 0;



  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    let targetId = event.targetID
    if(spellId === SPELLS.GUSTS_OF_MISTS.id) {
      if(this.owner.combatants.players[targetId].hasBuff(SPELLS.ESSENCE_FONT_BUFF.id, event.timestamp, 0, 0) === true) {
        debug && console.log('Player ID: ' + event.targetID + '  Timestamp: ' + event.timestamp);
        this.healEF++;
        this.healingEF += event.amount;
        this.absorbedhealingEF += (event.absorbed || 0);
        this.overhealingEF += (event.overheal || 0);
      }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.ESSENCE_FONT.id) {
      this.castStartEF = event.timestamp;
      this.castEF++;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
      this.targetsEF++;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.ESSENCE_FONT_BUFF.id) {
      this.targetsEF++;
    }
  }

  on_finished() {
    if(debug) {
      console.log('EF Mastery Hots Casted into: ' + (this.healEF / 2));
      console.log('EF Mastery Healing Amount: ' + this.healingEF);
      console.log('EF Mastery Overhealing Amount: ' + this.overhealingEF);
      console.log('EF Mastery Absorbed Amount: ' + this.absorbedhealingEF);
      console.log('EF Casts: ' + this.castEF);
      console.log('EF Targets Hit: ' + this.targetsEF);
      console.log('EF Avg Targets Hit per Cast: ' + (this.targetsEF / this.castEF));

    }
  }
}

export default EssenceFontMastery;
