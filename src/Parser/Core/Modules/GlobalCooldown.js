import Analyzer from 'Parser/Core/Analyzer';
import AlwaysBeCasting from './AlwaysBeCasting';

class GlobalCooldown extends Analyzer {
  static dependencies = {
    // Trigger the `globalcooldown` event
    alwaysBeCasting: AlwaysBeCasting,
  };

  history = [];

  on_globalcooldown(event) {
    this.history.push(event);
  }
}

export default GlobalCooldown;
