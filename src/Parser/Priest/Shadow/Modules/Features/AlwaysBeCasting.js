import React from 'react';

import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import SPELLS from 'common/SPELLS';

import Haste from '../Core/Haste';

const ONE_FILLER_GCD_HASTE_THRESHOLD = 1.4;

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static dependencies = {
    haste: Haste,
  };

  static ABILITIES_ON_GCD = [
    // handled in _removebuff
    SPELLS.VOID_TORRENT.id,
    SPELLS.MIND_FLAY.id,
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

  _castsSinceLastVoidBolt = 0;
  _skippableCastsBetweenVoidbolts = 0;

  get skippableCastsBetweenVoidbolts() {
    return this._skippableCastsBetweenVoidbolts;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (this.haste.current >= ONE_FILLER_GCD_HASTE_THRESHOLD) {
      if (spellId === SPELLS.VOID_BOLT.id) {
        this._castsSinceLastVoidBolt = 0;
      } else if (this.isOnGlobalCooldown(spellId)) {
        this._castsSinceLastVoidBolt += 1;
        if (this._castsSinceLastVoidBolt > 1) {
          this._skippableCastsBetweenVoidbolts += 1;
        }
      }
    }

    super.on_byPlayer_cast(event);
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (
      spellId === SPELLS.MIND_FLAY.id ||
      // spellId === SPELLS.DISPERSION.id ||
      spellId === SPELLS.VOID_TORRENT.id
    ) {
      this._lastCastFinishedTimestamp = event.timestamp;
    }
  }

  get downtime() {
    return this.totalTimeWasted / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.downtime,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const {
      isGreaterThan: {
        minor,
        average,
        major,
      }
    } = this.suggestionThresholds;

    when(this.downtime).isGreaterThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant - maybe refresh your dots.</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(average).major(major);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default AlwaysBeCasting;
