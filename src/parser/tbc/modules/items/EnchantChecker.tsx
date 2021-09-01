import { Trans } from '@lingui/macro';
import { ItemLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When } from 'parser/core/ParseResults';
import React from 'react';

// Example logs with missing enchants:
// https://www.warcraftlogs.com/reports/ydxavfGq1mBrM9Vc/#fight=1&source=14

class EnchantChecker extends Analyzer {
  static ENCHANTABLE_SLOTS = {
    0: <Trans id="common.slots.head">Head</Trans>,
    2: <Trans id="common.slots.shoulder">Shoulder</Trans>,
    4: <Trans id="common.slots.chest">Chest</Trans>,
    6: <Trans id="common.slots.legs">Legs</Trans>,
    7: <Trans id="common.slots.boots">Boots</Trans>,
    8: <Trans id="common.slots.bracers">Bracers</Trans>,
    9: <Trans id="common.slots.gloves">Gloves</Trans>,
    // 10: <Trans id="common.slots.ring">Ring</Trans>,
    // 11: <Trans id="common.slots.ring">Ring</Trans>,
    14: <Trans id="common.slots.cloak">Cloak</Trans>,
    15: <Trans id="common.slots.weapon">Weapon</Trans>,
    // 16: <Trans id="common.slots.offhand">OffHand</Trans>,
  };

  static MIN_ENCHANT_IDS = [
    // Head
    // Shoulder
    2979, // https://tbc.wowhead.com/spell=35403/inscription-of-faith
    2983, // https://tbc.wowhead.com/spell=35407/inscription-of-vengeance
    2981, // https://tbc.wowhead.com/spell=35405/inscription-of-discipline
    2977, // https://tbc.wowhead.com/spell=35355/inscription-of-warding
    2994, // https://tbc.wowhead.com/spell=35436/inscription-of-the-orb
    2990, // https://tbc.wowhead.com/spell=35432/inscription-of-the-knight
    2996, // https://tbc.wowhead.com/spell=35438/inscription-of-the-blade
    2992, // https://tbc.wowhead.com/spell=35434/inscription-of-the-oracle

    // Chest
    // Legs
    2745, // https://tbc.wowhead.com/spell=31369/silver-spellthread
    // Boots
    // Bracers
    // Gloves
    // Ring
    // Cloak
    // Weapon
    // Offhand
  ];

  // TODO add the new weapon enchants
  static MAX_ENCHANT_IDS = [
    // Head
    3001, // https://tbc.wowhead.com/spell=35445/glyph-of-renewal

    // Shoulder
    2980, // https://tbc.wowhead.com/spell=35404/greater-inscription-of-faith
    2986, // https://tbc.wowhead.com/spell=35417/greater-inscription-of-vengeance
    2982, // https://tbc.wowhead.com/spell=35406/greater-inscription-of-discipline
    2978, // https://tbc.wowhead.com/spell=35402/greater-inscription-of-warding
    2991, // https://tbc.wowhead.com/spell=35433/greater-inscription-of-the-knight
    2997, // https://tbc.wowhead.com/spell=35439/greater-inscription-of-the-blade
    2993, // https://tbc.wowhead.com/spell=35435/greater-inscription-of-the-oracle
    2995, // https://tbc.wowhead.com/spell=35437/greater-inscription-of-the-orb

    // Other
    2715, // https://tbc.wowhead.com/spell=29475/resilience-of-the-scourge

    // Chest
    3150, // https://tbc.wowhead.com/spell=33991/enchant-chest-restore-mana-prime

    // Legs
    2746, // https://tbc.wowhead.com/spell=31370/golden-spellthread

    // Boots
    2940, // https://tbc.wowhead.com/spell=34008/enchant-boots-boars-speed
    2656, // https://tbc.wowhead.com/spell=27948/enchant-boots-vitality
    2658, // https://tbc.wowhead.com/spell=27954/enchant-boots-surefooted

    // Bracers
    2617, // https://tbc.wowhead.com/spell=27911/enchant-bracer-superior-healing

    // Gloves
    2322, // https://tbc.wowhead.com/spell=33999/enchant-gloves-major-healing

    // Ring
    2930, // https://tbc.wowhead.com/spell=27926/enchant-ring-healing-power

    // Cloak
    1441, // https://tbc.wowhead.com/spell=34006/enchant-cloak-greater-shadow-resistance
    2664, // https://tbc.wowhead.com/spell=27962/enchant-cloak-major-resistance

    // Weapon
    2343, // https://tbc.wowhead.com/spell=34010/enchant-weapon-major-healing

    // Offhand
  ];

  get enchantableGear() {
    return Object.keys(EnchantChecker.ENCHANTABLE_SLOTS).reduce(
      (obj: { [key: number]: Item }, slot) => {
        const item = this.selectedCombatant._getGearItemBySlotId(Number(slot));
        // If there is no offhand, disregard the item.
        // If the icon has `offhand` in the name, we know it's not a weapon and doesn't need an enchant.
        // This is not an ideal way to determine if an offhand is a weapon.

        if (item.id === 0 || item.icon.includes('offhand') || item.icon.includes('shield')) {
          return obj;
        }
        obj[Number(slot)] = this.selectedCombatant._getGearItemBySlotId(Number(slot));

        return obj;
      },
      {},
    );
  }

  get numEnchantableGear() {
    return Object.keys(this.enchantableGear).length;
  }

  get slotsMissingEnchant() {
    const gear = this.enchantableGear;
    return Object.keys(gear).filter((slot) => !this.hasEnchant(gear[Number(slot)]));
  }

  get numSlotsMissingEnchant() {
    return this.slotsMissingEnchant.length;
  }

  get slotsMissingMaxEnchant() {
    const gear = this.enchantableGear;
    return Object.keys(gear).filter(
      (slot) => this.hasEnchant(gear[Number(slot)]) && !this.hasMaxEnchant(gear[Number(slot)]),
    );
  }

  get numSlotsMissingMaxEnchant() {
    return this.slotsMissingMaxEnchant.length;
  }

  hasEnchant(item: Item) {
    return Boolean(item.permanentEnchant);
  }

  hasMaxEnchant(item: Item) {
    if (item.permanentEnchant) {
      return EnchantChecker.MAX_ENCHANT_IDS.includes(item.permanentEnchant);
    }
    return false;
  }

  suggestions(when: When) {
    const gear = this.enchantableGear;
    const enchantSlots: { [key: number]: JSX.Element } = EnchantChecker.ENCHANTABLE_SLOTS;

    // iterating with keys instead of value because the values don't store what slot is being looked at
    Object.keys(gear).forEach((slot) => {
      const item = gear[Number(slot)];
      const slotName = enchantSlots[Number(slot)];
      const hasEnchant = this.hasEnchant(item);

      when(hasEnchant)
        .isFalse()
        .addSuggestion((suggest, actual, recommended) =>
          suggest(
            <Trans id="shared.enchantChecker.suggestions.noEnchant.label">
              Your{' '}
              <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
                {slotName}
              </ItemLink>{' '}
              is missing an enchant. Apply a strong enchant to very easily increase your throughput
              slightly.
            </Trans>,
          )
            .icon(item.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.MAJOR),
        );

      const noMaxEnchant = hasEnchant && !this.hasMaxEnchant(item);
      when(noMaxEnchant)
        .isTrue()
        .addSuggestion((suggest, actual, recommended) =>
          suggest(
            <Trans id="shared.enchantChecker.suggestions.weakEnchant.label">
              Your{' '}
              <ItemLink id={item.id} quality={item.quality} details={item} icon={false}>
                {slotName}
              </ItemLink>{' '}
              has a cheap enchant. Apply a strong enchant to very easily increase your throughput
              slightly.
            </Trans>,
          )
            .icon(item.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.MINOR),
        );
    });
  }
}

export default EnchantChecker;
