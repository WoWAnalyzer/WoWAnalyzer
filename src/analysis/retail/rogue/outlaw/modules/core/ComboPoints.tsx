import { ComboPointTracker } from 'analysis/retail/rogue/shared';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';

class ComboPoints extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };
  protected comboPointTracker!: ComboPointTracker;

  makeExtraSuggestion(spell: Spell) {
    return (
      <>
        Avoid wasting combo points when casting <SpellLink spell={spell} />.
      </>
    );
  }
}

export default ComboPoints;
