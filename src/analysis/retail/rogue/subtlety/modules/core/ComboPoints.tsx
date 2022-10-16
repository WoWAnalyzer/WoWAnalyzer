import { ComboPointTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import resourceSuggest from 'parser/shared/modules/resources/resourcetracker/ResourceSuggest';

class ComboPoints extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  protected comboPointTracker!: ComboPointTracker;

  get comboPointThresholds() {
    return {
      actual: this.comboPointTracker.wasted / this.comboPointTracker.generated,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  makeExtraSuggestion(spell: Spell) {
    return (
      <>
        Avoid wasting combo points when casting <SpellLink id={spell.id} />{' '}
      </>
    );
  }

  suggestions(when: When) {
    resourceSuggest(when, this.comboPointTracker, {
      spell: TALENTS.MARKED_FOR_DEATH_TALENT, // 5 CP
      minor: 0,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: this.makeExtraSuggestion(TALENTS.MARKED_FOR_DEATH_TALENT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.BACKSTAB, // 1 CP
      minor: 0.05,
      avg: 0.1,
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.BACKSTAB),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: TALENTS.GLOOMBLADE_TALENT, // 1 CP
      minor: 0.05,
      avg: 0.1,
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(TALENTS.GLOOMBLADE_TALENT),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.SHADOWSTRIKE, // 2 CP
      minor: 0.05,
      avg: 0.1,
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SHADOWSTRIKE),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.SHURIKEN_STORM, // 1 CP per target hit
      minor: 0.1,
      avg: 0.2,
      major: 0.3,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SHURIKEN_STORM),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.SHURIKEN_TOSS, // 1 CP
      minor: 0.05,
      avg: 0.1,
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SHURIKEN_TOSS),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.SHADOW_TECHNIQUES,
      minor: 0.1,
      avg: 0.2,
      major: 0.3,
      extraSuggestion: (
        <span>
          {' '}
          Use a weak Aura to track <SpellLink id={SPELLS.SHADOW_TECHNIQUES.id} />. This is an
          advanced suggestion and should not be addressed first.{' '}
        </span>
      ),
    });
    resourceSuggest(when, this.comboPointTracker, {
      spell: SPELLS.CHEAP_SHOT, // 2 CP
      minor: 0,
      avg: 0.1,
      major: 0.2,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.CHEAP_SHOT),
    });
  }
}

export default ComboPoints;
