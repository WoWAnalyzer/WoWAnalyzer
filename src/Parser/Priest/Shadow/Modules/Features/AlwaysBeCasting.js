import React from 'react';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import SPELLS from 'common/SPELLS';

import Haste from '../Core/Haste';


class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static dependencies = {
    haste: Haste,
  };


  static ABILITIES_ON_GCD = [
    // handled in _removebuff
    // SPELLS.VOID_TORRENT.id,
    // SPELLS.MIND_FLAY.id,
    // SPELLS.DISPERSION.id,

    // rotational:
    SPELLS.VOID_BOLT.id,
    SPELLS.VOID_ERUPTION.id,
    SPELLS.MIND_BLAST.id,
    SPELLS.VAMPIRIC_TOUCH.id,
    SPELLS.SHADOW_WORD_DEATH.id,
    SPELLS.SHADOW_WORD_PAIN.id,
    SPELLS.SHADOWFIEND.id,
    SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id,

    // talents:
    SPELLS.MINDBENDER_TALENT_SHADOW.id,
    SPELLS.POWER_INFUSION_TALENT.id,
    SPELLS.SHADOW_CRASH_TALENT.id,
    SPELLS.SHADOW_WORD_VOID_TALENT.id,
    SPELLS.MIND_BOMB_TALENT.id,

    // utility:
    SPELLS.SHADOWFORM.id,
    SPELLS.MIND_VISION.id,
    SPELLS.POWER_WORD_SHIELD.id,
    SPELLS.SHADOW_MEND.id,
    SPELLS.DISPEL_MAGIC.id,
    SPELLS.MASS_DISPEL.id,
    SPELLS.LEVITATE.id,
    SPELLS.SHACKLE_UNDEAD.id,
    SPELLS.PURIFY_DISEASE.id,

  ];

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (
        spellId === SPELLS.MIND_FLAY.id ||
        spellId === SPELLS.DISPERSION.id ||
        spellId === SPELLS.VOID_TORRENT.id
    ) {
      this._lastCastFinishedTimestamp = event.timestamp;
    }
  }

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant - maybe refresh your dots or replenish your mana with <SpellLink id={SPELLS.LIFE_TAP.id} /></span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  showStatistic = true;
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AlwaysBeCasting;
