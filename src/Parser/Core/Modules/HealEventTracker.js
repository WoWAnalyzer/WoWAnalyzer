import Analyzer from 'Parser/Core/Analyzer';

class HealEventTracker extends Analyzer {
  events = [];
  on_byPlayer_heal(event) {
    this.events.push(event);
  }
  on_byPlayerPet_heal(event) {
    this.events.push(event);
  }
  // TODO: Absorbs don't give us the health of the player at the time of the event, find a workaround for this as absorbs are pretty likely to be life savers
  // on_byPlayer_absorbed(event) {
  //   this.events.push(event);
  // }
}

export default HealEventTracker;
