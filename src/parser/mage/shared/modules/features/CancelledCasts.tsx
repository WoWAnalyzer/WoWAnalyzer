import React from 'react';

import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';
import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

class CancelledCasts extends CoreCancelledCasts {

  constructor(options: any) {
    super(options);
    this.IGNORED_ABILITIES = [
      //Include the spells that you do not want to be tracked and spells that are castable while casting (Like Fire Blast, Combustion, or Shimmer)
      SPELLS.FIRE_BLAST.id,
      SPELLS.COMBUSTION.id,
      SPELLS.SHIMMER_TALENT.id,
      SPELLS.ICE_FLOES_TALENT.id,
      SPELLS.DISPLACEMENT.id,
    ];
  }

  get cancelledPercentage() {
    return this.castsCancelled / this.totalCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.cancelledPercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    let extraMovementSpell: any = null;
    if(this.selectedCombatant.specId === SPECS.FROST_MAGE.id) {
      extraMovementSpell = <>, and <SpellLink id={SPELLS.ICE_FLOES_TALENT.id} /></>;
    } else if(this.selectedCombatant.specId === SPECS.ARCANE_MAGE.id) {
      extraMovementSpell = <>, and <SpellLink id={SPELLS.SLIPSTREAM_TALENT.id} /></>;
    }
    const joiner = extraMovementSpell === null ? ' and ' : ', ';

    when(this.suggestionThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You cancelled {formatPercentage(this.cancelledPercentage)}% of your spells. While it is expected that you will have to cancel a few casts to react to boss mechanics or move, you should try to ensure that you are cancelling as few casts as possible by utilizing movement abilities such as <SpellLink id={SPELLS.BLINK.id} />{joiner}<SpellLink id={SPELLS.SHIMMER_TALENT.id} />{extraMovementSpell}.</>)
          .icon('inv_misc_map_01')
          .actual(`${formatPercentage(actual)}% casts cancelled`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default CancelledCasts;
