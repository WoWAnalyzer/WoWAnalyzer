import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // artifact
    SPELLS.SINDRAGOSAS_FURY_ARTIFACT.id,
    // core frost abilities
    SPELLS.FROST_STRIKE.id,
    SPELLS.OBLITERATE.id,
    SPELLS.HOWLING_BLAST.id,
    SPELLS.EMPOWER_RUNE_WEAPON.id,
    SPELLS.REMORSELESS_WINTER.id,


    // frost active talents
    SPELLS.OBLITERATION_TALENT.id,

    // shared abilities
    SPELLS.ANTI_MAGIC_SHELL.id,
    SPELLS.CHAINS_OF_ICE.id,
    SPELLS.DARK_COMMAND.id,
    SPELLS.DEATH_GRIP.id,
    SPELLS.MIND_FREEZE.id,
    SPELLS.DEATH_STRIKE.id,
    SPELLS.ICEBOUND_FORTITUDE.id,
    SPELLS.CONTROL_UNDEAD.id,
    SPELLS.RAISE_ALLY.id,
    SPELLS.WRAITH_WALK.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), reducing time away from the boss unless due to mechanics.  If you do have to move, try casting filler spells, such as <SpellLink id={SPELLS.FROST_STRIKE.id}/> or <SpellLink id={SPELLS.OBLITERATE.id}/>.</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  showStatistic = true;
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
