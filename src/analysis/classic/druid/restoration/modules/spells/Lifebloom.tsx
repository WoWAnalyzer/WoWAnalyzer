import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/classic';

class Lifebloom extends Analyzer {
  static dependencies = {};

  constructor(options: Options) {
    super(options);
    this.active = false;
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM),
      this.applyLifebloom,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LIFEBLOOM),
      this.removeLifebloom,
    );
  }

  activeLifeblooms: number = 0;

  applyLifebloom(event: ApplyBuffEvent) {
    this.activeLifeblooms += 1;
  }

  removeLifebloom(event: RemoveBuffEvent) {
    this.activeLifeblooms -= 1;
  }
}

export default Lifebloom;
