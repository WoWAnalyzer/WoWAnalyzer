import Analyzer, { Options } from 'parser/core/Analyzer';

class Innervate extends Analyzer {
  static dependencies = {};

  constructor(options: Options) {
    super(options);

    this.active = false;
  }
}

export default Innervate;
