import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import AbilityTracker from './PaladinAbilityTracker';
import MaraadsDyingBreath from '../Items/MaraadsDyingBreath';

class FillerLightOfTheMartyrs extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
    maraadsDyingBreath: MaraadsDyingBreath,
    spellUsable: SpellUsable,
  };

  casts = 0;
  inefficientCasts = 0;
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_THE_MARTYR.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.MARAADS_DYING_BREATH_BUFF.id, event.timestamp)) {
      // Not a filler
      return;
    }

    this.casts += 1;

    const hasHolyShockAvailable = this.spellUsable.isAvailable(SPELLS.HOLY_SHOCK_CAST.id);
    if (hasHolyShockAvailable) {
      this.inefficientCasts += 1;
    }
  }

  get cpm() {
    return this.casts / (this.owner.fightDuration / 1000) * 60;
  }
  get inefficientCpm() {
    return this.inefficientCasts / (this.owner.fightDuration / 1000) * 60;
  }

  get cpmSuggestionThresholds() {
    return {
      actual: this.cpm,
      isGreaterThan: {
        minor: 1.5,
        average: 2,
        major: 3,
      },
      style: 'number',
    };
  }
  get inefficientCpmSuggestionThresholds() {
    return {
      actual: this.inefficientCpm,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 1.5,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.cpmSuggestionThresholds.actual).isGreaterThan(this.cpmSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        let suggestionText;
        let actualText;
        if (this.maraadsDyingBreath.active) {
          suggestionText = <Wrapper>With <ItemLink id={ITEMS.MARAADS_DYING_BREATH.id} /> you should only cast <b>one</b> <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> per <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />. Without the buff <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> is a very inefficient spell to cast. Try to only cast Light of the Martyr when it will save someone's life or when moving and all other instant cast spells are on cooldown.</Wrapper>;
          actualText = `${this.cpm.toFixed(2)} Casts Per Minute - ${this.casts} casts total (unbuffed only)`;
        } else {
          suggestionText = <Wrapper>You cast many <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />s. Light of the Martyr is an inefficient spell to cast, try to only cast Light of the Martyr when it will save someone's life or when moving and all other instant cast spells are on cooldown.</Wrapper>;
          actualText = `${this.cpm.toFixed(2)} Casts Per Minute - ${this.casts} casts total`;
        }
        return suggest(suggestionText)
          .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
          .actual(actualText)
          .recommended(`<${recommended} Casts Per Minute is recommended`)
          .regular(this.cpmSuggestionThresholds.isGreaterThan.average).major(this.cpmSuggestionThresholds.isGreaterThan.major);
      });

    when(this.inefficientCpmSuggestionThresholds.actual).isGreaterThan(this.inefficientCpmSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You cast {this.inefficientCasts} <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />s while <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> was available. Try to <b>never</b> cast <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> when something else is available.</Wrapper>)
          .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
          .actual(`${actual} casts while Holy Shock was available`)
          .recommended(`No inefficient casts is recommended`)
          .regular(this.inefficientCpmSuggestionThresholds.isGreaterThan.average).major(this.inefficientCpmSuggestionThresholds.isGreaterThan.major);
      });
  }
}

export default FillerLightOfTheMartyrs;
