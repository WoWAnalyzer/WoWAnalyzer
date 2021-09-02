import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BaseManaValues from 'parser/shared/modules/ManaValues';

class ManaValues extends BaseManaValues {
  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.active = true;
  }
}

export default ManaValues;
