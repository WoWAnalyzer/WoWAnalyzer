import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

class EssenceFontMastery extends Module {
  healEF = 0;
  healing = 0;

  castEF = 0;
  targetsEF = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    const targetId = event.targetID;
    if(spellId === SPELLS.GUSTS_OF_MISTS.id) {
      if(this.owner.combatants.players[targetId].hasBuff(SPELLS.ESSENCE_FONT_BUFF.id, event.timestamp, 0, 0) === true) {
        debug && console.log('Player ID: ' + event.targetID + '  Timestamp: ' + event.timestamp);
        this.healEF++;
        this.healing += (event.amount || 0 ) + (event.absorbed || 0);
      }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.ESSENCE_FONT.id) {
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
      console.log('EF Mastery Healing Amount: ' + this.healing);
      console.log('EF Casts: ' + this.castEF);
      console.log('EF Targets Hit: ' + this.targetsEF);
      console.log('EF Avg Targets Hit per Cast: ' + (this.targetsEF / this.castEF));

    }
  }
}

export default EssenceFontMastery;
