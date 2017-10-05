import Module from 'Parser/Core/Module';

class ActiveFocusWasted extends Module {

	events = [];
	tracker = 0; //to tell if cappedTimer prop has updated, since we can't compare arrays

  on_byPlayer_energize(event){
		if (event.sourceID === this.owner.player.id){
			this.tracker++;
			this.events.push(event);

  		}
	}
}


export default ActiveFocusWasted;

