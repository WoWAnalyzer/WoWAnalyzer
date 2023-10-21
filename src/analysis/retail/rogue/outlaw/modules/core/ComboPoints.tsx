import { ComboPointTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { When } from 'parser/core/ParseResults';
import resourceSuggest from 'parser/shared/modules/resources/resourcetracker/ResourceSuggest';
import TALENTS from 'common/TALENTS/rogue';

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

  suggestions(when: When) {
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.SINISTER_STRIKE, // 1 CP + 35% chance for another
      minor: 0.05, // Due to the 35% chance to double hit, especially with the Broadside RTB buff, you are bound to burn some CP
      avg: 0.1,
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SINISTER_STRIKE),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.AMBUSH, // 2 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.AMBUSH),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.PISTOL_SHOT, // 1 CP, 2 with proc and Quick Draw
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.PISTOL_SHOT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: TALENTS.GHOSTLY_STRIKE_TALENT, // 1 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(TALENTS.GHOSTLY_STRIKE_TALENT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.CHEAP_SHOT, // 2 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.CHEAP_SHOT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.GOUGE, // 1 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.GOUGE),
    });
  }
}

export default ComboPoints;
