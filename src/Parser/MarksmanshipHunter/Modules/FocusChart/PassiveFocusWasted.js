import ITEMS from 'common/ITEMS';
import Module from 'Parser/Core/Module';

class PassiveFocusWasted extends Module {

	cappedTimer = [];
	tracker = 0; //to tell if cappedTimer prop has updated, since we can't compare arrays

  on_byPlayer_cast(event){
		if (event.sourceID === this.owner.player.id &&(event.type === 'cast' || event.type === 'energize') ){
			this.tracker++;
			if(!this.cappedTimer){
			}
			const secIntoFight = (event.timestamp - this.owner.fight.start_time);
			if(!this.cappedTimer[secIntoFight]){
				this.cappedTimer[secIntoFight] = event.classResources[0]['amount'];

			}
		}
  }
}



export default PassiveFocusWasted;

