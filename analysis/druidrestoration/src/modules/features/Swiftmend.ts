import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';

import { isFromHardcast } from '../../normalizers/CastLinkNormalizer';

/** Just tracks healing done by Swiftmend hardcasts */
class Swiftmend extends Analyzer {
  hardcastSwiftmendHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendHeal,
    );
  }

  onSwiftmendHeal(event: HealEvent) {
    if (isFromHardcast(event)) {
      this.hardcastSwiftmendHealing += event.amount + (event.absorbed || 0);
    }
  }
}

export default Swiftmend;
