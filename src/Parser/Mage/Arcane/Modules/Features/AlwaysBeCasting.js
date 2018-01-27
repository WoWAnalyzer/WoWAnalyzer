import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.ARCANE_BLAST.id,
    SPELLS.ARCANE_BARRAGE.id,
    SPELLS.PRISMATIC_BARRIER.id,
    SPELLS.EVOCATION.id,
    SPELLS.FROST_NOVA.id,
    SPELLS.BLINK.id,
    SPELLS.ICE_BLOCK.id,
    SPELLS.ARCANE_EXPLOSION.id,
    SPELLS.MARK_OF_ALUNETH.id,
    SPELLS.SPELL_STEAL.id,
    SPELLS.GREATER_INVISIBILITY.id,
    SPELLS.SLOW_FALL.id,
    //talents
    SPELLS.ARCANE_FAMILIAR_TALENT.id,
    SPELLS.MIRROR_IMAGE_TALENT.id,
    SPELLS.RUNE_OF_POWER_TALENT.id,
    SPELLS.RING_OF_FROST_TALENT.id,
    SPELLS.SUPERNOVA_TALENT.id,
    SPELLS.ARCANE_ORB_TALENT.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(deadTimePercentage).isGreaterThan(0.2)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. If you have to move, try casting <SpellLink id={SPELLS.SCORCH.id} />.</span>)
            .icon('spell_mage_altertime')
            .actual(`${formatPercentage(actual)}% downtime`)
            .recommended(`<${formatPercentage(recommended)}% is recommended`)
            .regular(recommended + 0.15).major(recommended + 0.2);
        });
    }
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
