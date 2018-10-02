import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ManaUsage from 'common/ManaUsage';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import ExpandableStatisticBox from 'interface/others/ExpandableStatisticBox';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { formatNumber } from 'common/format';

/**
 * Tracks the mana usage of Holy Priests and creates a piechart with the breakdown.
 *
 * Example log: /report/A3X2gamPht4vRdDV/6-Heroic+Vectis+-+Kill+(5:36)/4-Flinkz
 */

class HolyPriestManaUsage extends ManaUsage {
  constructor(...args) {
    super(...args);

    this.listOfManaSpenders = [
      // Healing Spells
      SPELLS.GREATER_HEAL.id,
      SPELLS.FLASH_HEAL.id,
      SPELLS.RENEW.id,
      SPELLS.PRAYER_OF_MENDING_CAST.id,
      SPELLS.PRAYER_OF_HEALING.id,
      SPELLS.GUARDIAN_SPIRIT.id,
      SPELLS.DIVINE_HYMN_CAST.id,
      SPELLS.HOLY_WORD_SERENITY.id,
      SPELLS.HOLY_WORD_SANCTIFY.id,

      // Damage Spells
      SPELLS.HOLY_WORD_CHASTISE.id,
      SPELLS.HOLY_NOVA.id,
      SPELLS.HOLY_FIRE.id,

      // Utility Spells
      SPELLS.SHACKLE_UNDEAD.id,
      SPELLS.PURIFY.id,
      SPELLS.DISPEL_MAGIC.id,
      SPELLS.MASS_DISPEL.id,
      SPELLS.LEAP_OF_FAITH.id,
      SPELLS.PSYCHIC_SCREAM.id,
      SPELLS.POWER_WORD_FORTITUDE.id,
      SPELLS.MIND_VISION.id,
      SPELLS.LEVITATE.id,
      SPELLS.MIND_CONTROL.id,

      // Talented Spells
      SPELLS.BINDING_HEAL_TALENT.id,
      SPELLS.CIRCLE_OF_HEALING_TALENT.id,
      SPELLS.HOLY_WORD_SALVATION_TALENT.id,
      SPELLS.HALO_TALENT.id,
      SPELLS.DIVINE_STAR_TALENT.id,
      SPELLS.SHINING_FORCE_TALENT.id,
    ];

    this.manaSpenderCasts = {
      // Healing Spells
      [SPELLS.GREATER_HEAL.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.GREATER_HEAL.name,
        color: '#00ff00',
      },
      [SPELLS.FLASH_HEAL.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.FLASH_HEAL.name,
        color: '#008000',
      },
      [SPELLS.RENEW.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.RENEW.name,
        color: '#1aff1a',
      },
      [SPELLS.PRAYER_OF_MENDING_CAST.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.PRAYER_OF_MENDING_CAST.name,
        color: '#66ff66',
      },
      [SPELLS.PRAYER_OF_HEALING.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.PRAYER_OF_HEALING.name,
        color: '#004c00',
      },
      [SPELLS.GUARDIAN_SPIRIT.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.GUARDIAN_SPIRIT.name,
        color: '#99ff99',
      },
      [SPELLS.DIVINE_HYMN_CAST.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.DIVINE_HYMN_CAST.name,
        color: '#33ff33',
      },
      [SPELLS.HOLY_WORD_SERENITY.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HOLY_WORD_SERENITY.name,
        color: '#4dff4d',
      },
      [SPELLS.HOLY_WORD_SANCTIFY.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HOLY_WORD_SANCTIFY.name,
        color: '#00e600',
      },
      // Damage Spells
      [SPELLS.HOLY_WORD_CHASTISE.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HOLY_WORD_CHASTISE.name,
        color: '#ff0000',
      },
      [SPELLS.HOLY_NOVA.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HOLY_NOVA.name,
        color: '#ff3333',
      },
      [SPELLS.HOLY_FIRE.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HOLY_FIRE.name,
        color: '#800000',
      },
      // Utility Spells
      [SPELLS.PURIFY.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.PURIFY.name,
        color: '#0000e6',
      },
      [SPELLS.DISPEL_MAGIC.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.DISPEL_MAGIC.name,
        color: '#0000ff',
      },
      [SPELLS.MASS_DISPEL.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.MASS_DISPEL.name,
        color: '#0000cc',
      },
      [SPELLS.LEAP_OF_FAITH.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.LEAP_OF_FAITH.name,
        color: '#4d4dff',
      },
      [SPELLS.PSYCHIC_SCREAM.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.PSYCHIC_SCREAM.name,
        color: '#6666ff',
      },
      [SPELLS.POWER_WORD_FORTITUDE.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.POWER_WORD_FORTITUDE.name,
        color: '#8080ff',
      },
      [SPELLS.SHACKLE_UNDEAD.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.SHACKLE_UNDEAD.name,
        color: '#000033',
      },
      [SPELLS.MIND_VISION.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.MIND_VISION.name,
        color: '#000066',
      },
      [SPELLS.LEVITATE.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.LEVITATE.name,
        color: '#000000',
      },
      [SPELLS.MIND_CONTROL.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.MIND_CONTROL.name,
        color: '#4B0082',
      },
      // Talented Spells
      [SPELLS.HOLY_WORD_SALVATION_TALENT.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HOLY_WORD_SALVATION_TALENT.name,
        color: '#ffff00',
      },
      [SPELLS.HALO_TALENT.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.HALO_TALENT.name,
        color: '#b3b300',
      },
      [SPELLS.DIVINE_STAR_TALENT.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.DIVINE_STAR_TALENT.name,
        color: '#ffff33',
      },
      [SPELLS.SHINING_FORCE_TALENT.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.SHINING_FORCE_TALENT.name,
        color: '#666600',
      },
      [SPELLS.CIRCLE_OF_HEALING_TALENT.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.CIRCLE_OF_HEALING_TALENT.name,
        color: '#ffff1a',
      },
      [SPELLS.BINDING_HEAL_TALENT.id]: {
        casts: 0,
        manaUsed: 0,
        name: SPELLS.BINDING_HEAL_TALENT.name,
        color: '#999900',
      },
    };
  }

  statistic() {
    return (
      <ExpandableStatisticBox
        label="Total Mana Spent"
        icon={<ResourceIcon id={RESOURCE_TYPES.MANA.id} />}
        position={STATISTIC_ORDER.CORE(6)}
        value={formatNumber(this.totalManaSpent)}
        containerProps={{ className: 'col-xs-12' }}
      >
        {this.manaUsageChart()}
      </ExpandableStatisticBox>
    );
  }
}

export default HolyPriestManaUsage;
