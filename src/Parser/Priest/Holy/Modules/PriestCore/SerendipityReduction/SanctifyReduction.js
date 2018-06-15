import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

// dependencies
import Combatants from 'Parser/Core/Modules/Combatants';

const HOLY_WORD_SPELL_ID = SPELLS.HOLY_WORD_SANCTIFY.id;

// We are giving a buffer of 75% of CD due to the fact that the large
// majority of players would intentionally use spells to push holy words
// off cooldown if needed. This is a feelycraft metric that is open for
// modification or outright removal depending on opinions.
const FULL_OVERCAST_LENIENCE = 0.75;

class SanctifyReduction extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // Holy Word reduction spells (aka things that apply the respective Serendipity)
  serendipityProccers = {
    [SPELLS.PRAYER_OF_HEALING.id]: 1.0,
    [SPELLS.BINDING_HEAL_TALENT.id]: 0.5,
    // [SPELLS.PRAYER_OF_HEALING.id]: SPELLS.HOLY_WORD_SANCTIFY.id,
  };

  currentCooldown = 0;
  maxCooldown = 60000;
  serendipityReduction = 6000;

  holy_t20_2p = 0.0;
  holy_t20_2p_active = false;
  overcast = 0.0; // Overall wasted serendipity
  rawReduction = 0.0;
  casts = 0;
  effectiveFullOvercasts = 0;
  _tempOvercast = 0.0; // Tracker of how much wasted overcast between each holy word cast

  on_initialized() {
    // Set up proper serendipity reduction values
    if (this.combatants.selected.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id)) {
      this.serendipityReduction += 2000;
    }
    if (this.combatants.selected.hasBuff(SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF)) {
      this.serendipityReduction += 1000;
      this.holy_t20_2p_active = true;
    }

    // Check for Piety for serendipityProccers
    if (this.combatants.selected.hasTalent(SPELLS.PIETY_TALENT.id)) {
      this.serendipityProccers[SPELLS.PRAYER_OF_MENDING_CAST.id] = 1.0;
    }

    // Modify Sanctify CD based on trait
    this.maxCooldown -= ((this.combatants.selected.traitsBySpellId[SPELLS.HALLOWED_GROUND_TRAIT.id] || 0) * SPELLS.HALLOWED_GROUND_TRAIT.valuePerTrait);
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

      // Logic for determining Holy Priest 2P Set Bonus gain
      if (this.holy_t20_2p_active && difference > (actualSerendipityReduction - SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.value)) {
        this.holy_t20_2p += Math.min(1000, difference - (actualSerendipityReduction - SPELLS.HOLY_PRIEST_T20_2SET_BONUS_BUFF.value * this.serendipityProccers[spellId]));
      }
      this.currentCooldown -= actualSerendipityReduction;
    }
  }
}


export default SanctifyReduction;
