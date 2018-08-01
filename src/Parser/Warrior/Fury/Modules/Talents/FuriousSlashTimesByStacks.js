import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

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
  
  	get furiousSlashTimesByStacks() {
		return this.furiousSlashStacks;
	}
	
	on_byPlayer_damage(event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.FURIOUS_SLASH_TALENT.id || event.hit_type === HIT_TYPES.DODGE || event.hit_type === HIT_TYPES.DODGE)
		{
			return;
		}
		let stack = null;
		if(!this.lastFuriousSlashStack)
		{
			stack = 1;
		}
		else{
			if(this.lastFuriousSlashStack < MAX_FURIOUS_SLASH_STACKS)
			{
				stack = this.lastFuriousSlashStack + 1;
			}
			else{
				stack = MAX_FURIOUS_SLASH_STACKS;
			}
		}
		this.furiousSlashStacks[this.lastFuriousSlashStack].push(event.timestamp - this.lastFuriousSlashUpdate);
		this.lastFuriousSlashUpdate = event.timestamp;
		this.lastFuriousSlashStack = stack;
	}
	on_byPlayer_removebuff(event) {
		const spellId = event.ability.guid;
		if(spellId !== SPELLS.FURIOUS_SLASH_TALENT_BUFF.id){
			return;
		}
		
		this.furiousSlashStacks[this.lastFuriousSlashStack].push(event.timestamp - this.lastFuriousSlashUpdate);
		this.lastFuriousSlashUpdate = event.timestamp;
		this.lastFuriousSlashStack = 0;
	}
}

export default FuriousSlashTimesByStacks;