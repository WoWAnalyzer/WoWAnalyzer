import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ManaUsage from 'common/ManaUsage';

/**
 * Tracks the mana usage of resto druid and creates a piechart with the breakdown.
 *
 * Example log: /report/tVvxzMN74jDCbkZF/28-Heroic+G'huun+-+Kill+(6:49)/1-Blazyb
 */

class HolyPriestManaUsage extends ManaUsage {
  constructor(...args) {
    super(...args);

    this.listOfManaSpenders = [
      SPELLS.GREATER_HEAL.id,
      SPELLS.FLASH_HEAL.id,
      SPELLS.RENEW.id,
      SPELLS.PRAYER_OF_MENDING_CAST.id,
      SPELLS.PRAYER_OF_HEALING.id,
      SPELLS.GUARDIAN_SPIRIT.id,
      SPELLS.DIVINE_HYMN_CAST.id,
      SPELLS.HOLY_WORD_SERENITY.id,
      SPELLS.HOLY_WORD_SANCTIFY.id,

      SPELLS.HOLY_WORD_SALVATION_TALENT.id,
      SPELLS.HALO_TALENT.id,
      SPELLS.DIVINE_STAR_TALENT.id,

      SPELLS.PURIFY.id,
      SPELLS.DISPEL_MAGIC.id,
      SPELLS.MASS_DISPEL.id,
      SPELLS.LEAP_OF_FAITH.id,
      SPELLS.HOLY_NOVA.id,
      SPELLS.PSYCHIC_SCREAM.id,
      SPELLS.HOLY_FIRE.id,
      SPELLS.POWER_WORD_FORTITUDE.id,
    ];

    this.manaSpenderCasts = {
      [SPELLS.GREATER_HEAL.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.GREATER_HEAL.name,
        color: '#032F71',
      },
      [SPELLS.FLASH_HEAL.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.FLASH_HEAL.name,
        color: '#F5E094',
      },
      [SPELLS.RENEW.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.RENEW.name,
        color: '#02CA3C',
      },
      [SPELLS.PRAYER_OF_MENDING_CAST.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.PRAYER_OF_MENDING_CAST.name,
        color: '#D8BFD8',
      },
      [SPELLS.PRAYER_OF_HEALING.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.PRAYER_OF_HEALING.name,
        color: '#F5FFFA',
      },
      [SPELLS.GUARDIAN_SPIRIT.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.GUARDIAN_SPIRIT.name,
        color: '#00CED1',
      },
      [SPELLS.DIVINE_HYMN_CAST.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.DIVINE_HYMN_CAST.name,
        color: '#8B0000',
      },
      [SPELLS.HOLY_WORD_SERENITY.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HOLY_WORD_SERENITY.name,
        color: '#4FD9D1',
      },
      [SPELLS.HOLY_WORD_SANCTIFY.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HOLY_WORD_SANCTIFY.name,
        color: '#F7F8D1',
      },
      [SPELLS.HOLY_WORD_SALVATION_TALENT.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HOLY_WORD_SALVATION_TALENT.name,
        color: '#ADFF2F',
      },
      [SPELLS.HALO_TALENT.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HALO_TALENT.name,
        color: '#FFA07A',
      },
      [SPELLS.DIVINE_STAR_TALENT.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.DIVINE_STAR_TALENT.name,
        color: '#FAFAD2',
      },
      [SPELLS.PURIFY.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.PURIFY.name,
        color: '#C0C0C0',
      },
      [SPELLS.DISPEL_MAGIC.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.DISPEL_MAGIC.name,
        color: '#E0FFFF',
      },
      [SPELLS.MASS_DISPEL.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.MASS_DISPEL.name,
        color: '#006400',
      },
      [SPELLS.LEAP_OF_FAITH.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.LEAP_OF_FAITH.name,
        color: '#6495ED',
      },
      [SPELLS.HOLY_NOVA.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HOLY_NOVA.name,
        color: '#B8860B',
      },
      [SPELLS.PSYCHIC_SCREAM.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.PSYCHIC_SCREAM.name,
        color: '#6B8E23',
      },
      [SPELLS.HOLY_FIRE.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HOLY_FIRE.name,
        color: '#FFFFF0',
      },
      [SPELLS.POWER_WORD_FORTITUDE.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.POWER_WORD_FORTITUDE.name,
        color: '#4B0082',
      },

    };
  }
}

export default HolyPriestManaUsage;
