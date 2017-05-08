import Module from 'Parser/Core/Module';

const debug = true;
const TIMEOUT = 1000;

class Initialize extends Module {
  encounterStarted = false;
  firstEventTimestamp = null;
  on_event(event) {
    this.firstEventTimestamp = this.firstEventTimestamp || event.timestamp;
    switch (event.type) {
      case 'encounterstart':
        this.encounterStarted = true;
        debug && console.log('Encounter started!', event);
        break;
      case 'combatantinfo':
        debug && console.log('Combatant info received', event);
        break;
      default:
        if (this.encounterStarted || (this.firstEventTimestamp !== null && (event.timestamp - this.firstEventTimestamp) > TIMEOUT)) {
          debug && console.log('Finished initializing!', event);
          this.active = false;
          this.owner.triggerEvent('initialized');
        } else {
          console.error('Received an unexpected event prior to `encounterstart`:', event);
        }
        break;
    }
  }
}

export default Initialize;
