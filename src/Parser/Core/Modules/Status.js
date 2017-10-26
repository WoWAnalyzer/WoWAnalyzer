import Analyzer from 'Parser/Core/Analyzer';

class Status extends Analyzer {
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
