import Module from 'Main/Parser/Module';

const debug = false;

class Initialize extends Module {
  on_event(event) {
    if (event.type === 'combatantinfo' || event.type === 'encounterstart') {
      debug && console.log('Still waiting...', event);
    } else {
      debug && console.log('Finished initializing!', event);
      this.active = false;
      this.owner.triggerEvent('initialized');
    }
  }
}

export default Initialize;
