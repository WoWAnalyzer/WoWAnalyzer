import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Abilities from 'Parser/Core/Modules/Abilities';

const ALLOWED_CASTS_DURING_DRW = [
  SPELLS.DEATH_STRIKE.id,
  SPELLS.HEART_STRIKE.id,
  SPELLS.BLOOD_BOIL.id,
  SPELLS.MARROWREND.id,
  SPELLS.CONSUMPTION_TALENT.id, // todo => test if new consumption talent actually works with DRW
];

class DancingRuneWeapon extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
  };

  castsDuringDRW = [];

  on_byPlayer_cast(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.DANCING_RUNE_WEAPON_BUFF.id)) {
      return;
    }

    //push all casts during DRW that were on the GCD in array
    if (event.ability.guid !== SPELLS.RAISE_ALLY.id && //probably usefull to rezz someone even if it's a personal DPS-loss
      this.abilities.getAbility(event.ability.guid) !== undefined &&
      this.abilities.getAbility(event.ability.guid).isOnGCD === true) {
      this.castsDuringDRW.push(event.ability.guid);
    }
  }

  get goodDRWCasts() {
    return this.castsDuringDRW.filter((val, index) => {
      return ALLOWED_CASTS_DURING_DRW.includes(val);
    });
  }

  get SuggestionThresholds() {
    return {
      actual: this.goodDRWCasts.length / this.castsDuringDRW.length,
      isLessThan: {
        minor: 1,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  spellLinks(id, index) {
    if (id === SPELLS.CONSUMPTION_TALENT.id) {
      return <span>and (if in AoE)<SpellLink id={id} /></span>;
    } else if (index + 2 === ALLOWED_CASTS_DURING_DRW.length) {
      return <span><SpellLink id={id} /> </span>;
    } else {
      return <span><SpellLink id={id} />, </span>;
    }
  }

  get goodDRWSpells() {
    return (
      <div>
        Try and prioritize {ALLOWED_CASTS_DURING_DRW.map((id, index) => this.spellLinks(id, index))}
      </div>
    );
  }

  suggestions(when) {
    when(this.SuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Avoid casting spells during <SpellLink id={SPELLS.DANCING_RUNE_WEAPON.id} /> that don't benefit from the coppies such as <SpellLink id={SPELLS.BLOODDRINKER_TALENT.id} /> and <SpellLink id={SPELLS.DEATH_AND_DECAY.id} />. Check the cooldown-tab below for more detailed breakdown.{this.goodDRWSpells}</React.Fragment>)
          .icon(SPELLS.DANCING_RUNE_WEAPON.icon)
          .actual(`${ this.goodDRWCasts.length } out of ${ this.castsDuringDRW.length} casts during DRW were good`)
          .recommended(`${this.castsDuringDRW.length} recommended`);
      });
  }
}

export default DancingRuneWeapon;
