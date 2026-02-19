import SPELLS from 'common/SPELLS';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

class Cull extends Analyzer {
  cullCasts = 0;
  cullEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_METAMORPHOSIS_TALENT);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CULL), this.onCullCast);
  }

  onCullCast() {
    return;
  }
}

export default Cull;
