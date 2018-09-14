import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';

const HOLY_WORD_SPELL_ID = SPELLS.HOLY_WORD_SERENITY.id;

// We are giving a buffer of 75% of CD due to the fact that the large
// majority of players would intentionally use spells to push holy words
// off cooldown if needed. This is a feelycraft metric that is open for
// modification or outright removal depending on opinions.
const FULL_OVERCAST_LENIENCE = 0.75;

class SerenityReduction extends Analyzer {
  // Holy Word reduction spells (aka things that apply the respective Serendipity)
  serendipityProccers = {
    [SPELLS.GREATER_HEAL.id]: 1.0,
    [SPELLS.FLASH_HEAL.id]: 1.0,
    [SPELLS.BINDING_HEAL_TALENT.id]: 0.5,
  };

  currentCooldown = 0;
  maxCooldown = 60000;
  serendipityReduction = 6000;

  overcast = 0.0; // Overall wasted serendipity
  rawReduction = 0.0;
  casts = 0;
  effectiveFullOvercasts = 0;
  _tempOvercast = 0.0; // Tracker of how much wasted overcast between each holy word cast

  constructor(...args) {
    super(...args);
    // Set up proper serendipity reduction values
    if (this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id)) {
      this.serendipityReduction += 2000;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === HOLY_WORD_SPELL_ID) {
      this.currentCooldown = event.timestamp + this.maxCooldown;
      this.casts += 1;

      this.effectiveFullOvercasts += Math.floor(this._tempOvercast / 1000 / (this.maxCooldown * FULL_OVERCAST_LENIENCE));
      this._tempOvercast = 0.0;
    }

    if (this.serendipityProccers[spellId.toString()] !== undefined) {
      const actualSerendipityReduction = this.serendipityReduction * this.serendipityProccers[spellId];
      this.rawReduction += actualSerendipityReduction;

      const difference = this.currentCooldown - event.timestamp;
      if (difference < actualSerendipityReduction) {
        const overlap = Math.min(
          actualSerendipityReduction,
          Math.abs((actualSerendipityReduction) - difference)
        );
        this.overcast += overlap;
        this._tempOvercast += overlap;
      }
      this.currentCooldown -= actualSerendipityReduction;
    }
  }
}


export default SerenityReduction;
