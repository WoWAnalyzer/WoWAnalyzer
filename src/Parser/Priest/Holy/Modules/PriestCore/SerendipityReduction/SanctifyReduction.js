import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

const HOLY_WORD_SPELL_ID = SPELLS.HOLY_WORD_SANCTIFY.id;

// We are giving a buffer of 75% of CD due to the fact that the large
// majority of players would intentionally use spells to push holy words
// off cooldown if needed. This is a feelycraft metric that is open for
// modification or outright removal depending on opinions.
const FULL_OVERCAST_LENIENCE = 0.75;

class SanctifyReduction extends Analyzer {
  // Holy Word reduction spells (aka things that apply the respective Serendipity)
  serendipityProccers = {
    [SPELLS.PRAYER_OF_HEALING.id]: () => this.serendipityReduction * 1.0,
    [SPELLS.BINDING_HEAL_TALENT.id]: () => this.serendipityReduction * 0.5,
  };

  reductionBySpell = {};

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
    if (this.selectedCombatant.hasTrait(SPELLS.WORD_OF_MENDING.id)) {
      this.serendipityProccers[SPELLS.PRAYER_OF_MENDING_CAST.id] = () => 2000;
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
      const actualSerendipityReduction = this.serendipityProccers[spellId]();
      this.rawReduction += actualSerendipityReduction;

      if (this.reductionBySpell[spellId.toString()] == null) {
        this.reductionBySpell[spellId.toString()] = 0;
      }
      this.reductionBySpell[spellId.toString()] += actualSerendipityReduction;

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

export default SanctifyReduction;
