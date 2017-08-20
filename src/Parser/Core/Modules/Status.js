import Module from 'Parser/Core/Module';

class Status extends Module {
  initialized = false;
  on_initialized() {
    this.initialized = true;
  }
  finished = false;
  on_finished() {
    this.finished = true;
  }
}

export default Status;
