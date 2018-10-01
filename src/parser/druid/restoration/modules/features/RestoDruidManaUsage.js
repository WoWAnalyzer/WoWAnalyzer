import React from 'react';

import SPELLS from 'common/SPELLS';
import ManaUsage from 'common/ManaUsage';

/**
 * Tracks the mana usage of resto druid and creates a piechart with the breakdown.
 *
 * Example log: /report/tVvxzMN74jDCbkZF/28-Heroic+G'huun+-+Kill+(6:49)/1-Blazyb
 */

class RestoDruidManaUsage extends ManaUsage {
  constructor(...args) {
    super(...args);

    this.listOfManaSpenders = [
      SPELLS.LIFEBLOOM_HOT_HEAL.id,
      SPELLS.REJUVENATION.id,
      SPELLS.WILD_GROWTH.id,
      SPELLS.EFFLORESCENCE_CAST.id,
      SPELLS.REGROWTH.id,
      SPELLS.SWIFTMEND.id,
      SPELLS.TRANQUILITY_CAST.id,
      SPELLS.CENARION_WARD_TALENT.id,
    ];

    this.manaSpenderCasts = {
      [SPELLS.LIFEBLOOM_HOT_HEAL.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.LIFEBLOOM_HOT_HEAL.name,
        color: '#b2d689',
      },
      [SPELLS.REJUVENATION.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.REJUVENATION.name,
        color: '#b013c6',
      },
      [SPELLS.WILD_GROWTH.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.WILD_GROWTH.name,
        color: '#70d181',
      },
      [SPELLS.EFFLORESCENCE_CAST.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.EFFLORESCENCE_CAST.name,
        color: '#f95160',
      },
      [SPELLS.REGROWTH.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.REGROWTH.name,
        color: '#168a45',
      },
      [SPELLS.SWIFTMEND.id]: {
        casts: 0,
        manaUsed: 0,
        names: SPELLS.SWIFTMEND.name,
        color: '#31558f',
      },
      [SPELLS.TRANQUILITY_CAST.id]: {
        casts: 0,
        manaUsed: 0,
        names: SPELLS.TRANQUILITY_CAST.name,
        color: '#46709a',
      },
      [SPELLS.CENARION_WARD_TALENT.id]: {
        casts: 0,
        manaUsed: 0,
        names: SPELLS.CENARION_WARD_TALENT.name,
        color: '#fff',
      },
    };
  }
}

export default RestoDruidManaUsage;
