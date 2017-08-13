import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

class FillerLightOfTheMartyrs extends Module {
  suggestions(when) {
    const abilityTracker = this.owner.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const lightOfTheMartyrs = getAbility(SPELLS.LIGHT_OF_THE_MARTYR.id).casts || 0;
    let fillerLotms = lightOfTheMartyrs;
    if (this.owner.modules.maraadsDyingBreath.active) {
      const lightOfTheDawns = getAbility(SPELLS.LIGHT_OF_DAWN_CAST.id).casts || 0;
      fillerLotms -= lightOfTheDawns;
    }
    const fillerLotmsPerMinute = fillerLotms / (this.owner.fightDuration / 1000) * 60;
    when(fillerLotmsPerMinute).isGreaterThan(1.5)
      .addSuggestion((suggest, actual, recommended) => {
        let suggestionText;
        let actualText;
        if (this.owner.modules.maraadsDyingBreath.active) {
          suggestionText = <span>With <ItemLink id={ITEMS.MARAADS_DYING_BREATH.id} /> you should only cast <b>one</b> <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> per <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />. Without the buff <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> is a very inefficient spell to cast. Try to only cast Light of the Martyr when it will save someone's life or when moving and all other instant cast spells are on cooldown.</span>;
          actualText = `${fillerLotmsPerMinute.toFixed(2)} Casts Per Minute - ${fillerLotms} casts total (unbuffed only)`;
        } else {
          suggestionText = <span>You cast many <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} />s. Light of the Martyr is an inefficient spell to cast, try to only cast Light of the Martyr when it will save someone's life or when moving and all other instant cast spells are on cooldown.</span>;
          actualText = `${fillerLotmsPerMinute.toFixed(2)} Casts Per Minute - ${fillerLotms} casts total`;
        }
        return suggest(suggestionText)
          .icon(SPELLS.LIGHT_OF_THE_MARTYR.icon)
          .actual(actualText)
          .recommended(`<${recommended} Casts Per Minute is recommended`)
          .regular(recommended + 0.5).major(recommended + 1.5);
      });
  }
}

export default FillerLightOfTheMartyrs;
