import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Abilities from 'parser/core/modules/Abilities';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import Events from 'parser/core/Events';

const ALLOWED_CASTS_DURING_DRW = [
  SPELLS.DEATH_STRIKE.id,
  SPELLS.HEART_STRIKE.id,
  SPELLS.BLOOD_BOIL.id,
  SPELLS.MARROWREND.id,
  SPELLS.CONSUMPTION_TALENT.id, // todo => test if new consumption talent actually works with DRW
];

class DancingRuneWeapon extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  castsDuringDRW = [];

  constructor(options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.DANCING_RUNE_WEAPON_BUFF.id)) {
      return;
    }

    //push all casts during DRW that were on the GCD in array
    if (event.ability.guid !== SPELLS.RAISE_ALLY.id && //probably usefull to rezz someone even if it's a personal DPS-loss
      event.ability.guid !== SPELLS.DANCING_RUNE_WEAPON.id && //because you get the DRW buff before the cast event since BFA
      this.abilities.getAbility(event.ability.guid) !== undefined &&
      this.abilities.getAbility(event.ability.guid).gcd) {
      this.castsDuringDRW.push(event.ability.guid);
    }
  }

  get goodDRWCasts() {
    return this.castsDuringDRW.filter((val, index) => ALLOWED_CASTS_DURING_DRW.includes(val));
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
      return <React.Fragment key={id}>and (if in AoE)<SpellLink id={id} /></React.Fragment>;
    } else if (index + 2 === ALLOWED_CASTS_DURING_DRW.length) {
      return <React.Fragment key={id}><SpellLink id={id} /> </React.Fragment>;
    } else {
      return <React.Fragment key={id}><SpellLink id={id} />, </React.Fragment>;
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
      .addSuggestion((suggest, actual, recommended) => suggest(<>Avoid casting spells during <SpellLink id={SPELLS.DANCING_RUNE_WEAPON.id} /> that don't benefit from the coppies such as <SpellLink id={SPELLS.BLOODDRINKER_TALENT.id} /> and <SpellLink id={SPELLS.DEATH_AND_DECAY.id} />. Check the cooldown-tab below for more detailed breakdown.{this.goodDRWSpells}</>)
          .icon(SPELLS.DANCING_RUNE_WEAPON.icon)
          .actual(i18n._(t('deathknight.blood.suggestions.dancingRuneWeapon.numberCasts')`${ this.goodDRWCasts.length } out of ${ this.castsDuringDRW.length} casts during DRW were good`))
          .recommended(`${this.castsDuringDRW.length} recommended`));
  }
}

export default DancingRuneWeapon;
