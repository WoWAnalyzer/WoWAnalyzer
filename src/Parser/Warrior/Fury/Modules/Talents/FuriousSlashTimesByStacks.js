import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

/* 
  furiousSlashTimesByStacks() returns an array with the durations of each FS buff stack
*/

const MAX_FURIOUS_SLASH_STACKS = 3;

class FuriousSlashTimesByStacks extends Analyzer {
	
	furiousSlashStacks = [];
	lastFuriousSlashStack = 0;
	lastFuriousSlashUpdate = this.owner.fight.start_time;
	
	constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FURIOUS_SLASH_TALENT.id);
	this.furiousSlashStacks = Array.from({length: MAX_FURIOUS_SLASH_STACKS + 1}, x => []);
  }
	
	handleStacks(event, stack = null) {
    if (event.type === 'removebuff' || isNaN(event.stack)) { //NaN check if player is dead during on_finish
      event.stack = 0;
    }
    if (event.type === 'applybuff') {
      event.stack = 1;
    }

    if (stack) {
      event.stack = stack;
    }

    this.furiousSlashStacks[this.lastFuriousSlashStack].push(event.timestamp - this.lastFuriousSlashUpdate);
    this.lastFuriousSlashUpdate = event.timestamp;
    this.lastFuriousSlashStack = event.stack;
  }
  
  	get furiousSlashTimesByStacks() {
		return this.furiousSlashStacks;
	}
	
	on_byPlayer_applybuff(event){
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.FURIOUS_SLASH_TALENT_BUFF.id){
			return;
		}
		this.handleStacks(event);
	}
	on_byPlayer_applybuffstack(event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.FURIOUS_SLASH_TALENT_BUFF.id){
			return;
		}
		this.handleStacks(event);
	}
	on_byPlayer_removeBuff(event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.FURIOUS_SLASH_TALENT_BUFF.id){
			return;
		}
		this.handleStacks(event);
		//debug && console.log('removed buff');
	}
	
	on_finished(event) {
		this.handleStacks(event, this.lastFuriousSlashStack);
    }
}

export default FuriousSlashTimesByStacks;