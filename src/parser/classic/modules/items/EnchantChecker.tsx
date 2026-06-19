import type { JSX } from 'react';
import GEAR_SLOTS, { GEAR_SLOT_NAMES } from 'game/GEAR_SLOTS';
import BaseEnchantChecker from 'parser/shared/modules/items/EnchantChecker';
import { GearSlotName } from 'parser/core/Combatant';
import { Item } from 'parser/core/Events';
import { Enchant as EnchantItem } from 'common/ITEMS/Item';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

// Mists of Pandaria enchant data. Enchant ids are the `permanentEnchant` (SpellItemEnchantment)
// effect ids, sourced from wowsims/mop (assets/database/db.json).
// NOTE: In MoP the Head slot can no longer be enchanted (Cataclysm head Arcanums were removed) —
// the head only takes a Meta Gem now, so it is intentionally absent from the enchantable slots.
const ENCHANTABLE_SLOT_NAMES = [
  'SHOULDER',
  'CHEST',
  'LEGS',
  'FEET',
  'WRISTS',
  'HANDS',
  'BACK',
  'MAINHAND',
  'OFFHAND',
] as const satisfies readonly GearSlotName[];

const ENCHANTABLE_SLOTS: Partial<Record<GearSlotName, JSX.Element>> = Object.fromEntries(
  ENCHANTABLE_SLOT_NAMES.map((slot) => [slot, GEAR_SLOT_NAMES[GEAR_SLOTS[slot]]]),
);

// Lower-rank / budget MoP enchants. Currently informational only — the base EnchantChecker grades
// any present enchant as at least "OK"; only MaxEnchantIds promotes an enchant to "Good".
const MIN_ENCHANT_IDS = [
  // Death Knight Runeforges — all valid for DK but graded per-spec by subclasses
  3368, // Rune of the Fallen Crusader
  3370, // Rune of Razorice
  3847, // Rune of the Stoneskin Gargoyle
  3369, // Rune of Cinderglacier
  3366, // Rune of Lichbane
  3365, // Rune of Swordshattering
  3367, // Rune of Spellshattering
  3594, // Rune of Swordbreaking
  3595, // Rune of Spellbreaking
  3883, // Rune of the Nerubian Carapace
  // Shoulder (Inscription, non-greater)
  4907, // Tiger Fang Inscription (Strength)
  4908, // Tiger Claw Inscription (Agility)
  4909, // Crane Wing Inscription (Intellect)
  4910, // Ox Horn Inscription (Stamina)
  // Legs (lesser leg armors / spellthreads)
  4870, // Toughened Leg Armor (Stamina)
  4871, // Sha-Touched Leg Armor (Agility)
  4872, // Brutal Leg Armor (Strength)
  5003, // Cerulean Spellthread (Intellect)
  5004, // Pearlescent Spellthread (Spirit)
];

const MAX_ENCHANT_IDS = [
  // Shoulder (Inscription)
  4803, // Greater Tiger Fang Inscription (Strength)
  4804, // Greater Tiger Claw Inscription (Agility)
  4805, // Greater Ox Horn Inscription (Stamina)
  4806, // Greater Crane Wing Inscription (Intellect)
  4912, // Secret Ox Horn Inscription (Scribe-only)
  4913, // Secret Tiger Fang Inscription (Scribe-only)
  4914, // Secret Tiger Claw Inscription (Scribe-only)
  4915, // Secret Crane Wing Inscription (Scribe-only)
  // Cloak
  4421, // Enchant Cloak - Accuracy
  4422, // Enchant Cloak - Greater Protection
  4423, // Enchant Cloak - Superior Intellect
  4424, // Enchant Cloak - Superior Critical Strike
  4892, // Lightweave Embroidery (Rank 3)
  4893, // Darkglow Embroidery (Rank 3)
  4894, // Swordguard Embroidery (Rank 3)
  // Chest
  4417, // Enchant Chest - Super Resilience
  4418, // Enchant Chest - Mighty Spirit
  4419, // Enchant Chest - Glorious Stats
  4420, // Enchant Chest - Superior Stamina
  // Bracers
  4411, // Enchant Bracer - Mastery
  4412, // Enchant Bracer - Major Dodge
  4414, // Enchant Bracer - Super Intellect
  4415, // Enchant Bracer - Exceptional Strength
  4416, // Enchant Bracer - Greater Agility
  4875, // Fur Lining - Agility (Rank 3)
  4877, // Fur Lining - Intellect (Rank 3)
  4878, // Fur Lining - Stamina (Rank 3)
  4879, // Fur Lining - Strength (Rank 3)
  // Gloves
  4430, // Enchant Gloves - Greater Haste
  4431, // Enchant Gloves - Superior Expertise
  4432, // Enchant Gloves - Super Strength
  4433, // Enchant Gloves - Superior Mastery
  4898, // Synapse Springs (Mark II) (Engineering)
  // Legs (leg armors / greater spellthreads)
  4822, // Shadowleather Leg Armor (Agility)
  4823, // Angerhide Leg Armor (Strength)
  4824, // Ironscale Leg Armor (Stamina)
  4825, // Greater Cerulean Spellthread (Intellect)
  4826, // Greater Pearlescent Spellthread (Spirit)
  // Boots
  4426, // Enchant Boots - Greater Haste
  4427, // Enchant Boots - Greater Precision
  4428, // Enchant Boots - Blurred Speed
  4429, // Enchant Boots - Pandaren's Step
  // Weapon
  4441, // Enchant Weapon - Windsong
  4442, // Enchant Weapon - Jade Spirit
  4443, // Enchant Weapon - Elemental Force
  4444, // Enchant Weapon - Dancing Steel
  4445, // Enchant Weapon - Colossus
  4446, // Enchant Weapon - River's Song
  4434, // Enchant Off-Hand - Major Intellect
  // Weapon (PvP)
  5035, // Enchant Weapon - Glorious Tyranny
  5124, // Enchant Weapon - Spirit of Conquest
  5125, // Enchant Weapon - Bloody Dancing Steel
  8550, // Enchant Weapon - Tyranny
];

class EnchantChecker extends BaseEnchantChecker {
  get EnchantableSlots() {
    return ENCHANTABLE_SLOTS;
  }

  get MinEnchantIds(): number[] {
    return MIN_ENCHANT_IDS;
  }

  get MaxEnchantIds(): number[] {
    return MAX_ENCHANT_IDS;
  }

  boxRowPerformance(item: Item, _recommendedEnchantments: number[] | undefined) {
    // For Classic the MaxEnchantIds list is the curated best-in-slot tier, so any max-tier enchant
    // is graded Perfect (players legitimately run several top-tier variants per slot — e.g. Greater
    // vs Secret inscriptions, or Synapse Springs on gloves — and they should all count). A lesser
    // enchant is OK; a missing one Fails.
    if (this.hasEnchant(item)) {
      return this.hasMaxEnchant(item) ? QualitativePerformance.Perfect : QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  boxRowTooltip(
    item: Item,
    slotName: JSX.Element,
    recommendedEnchantments: EnchantItem[] | undefined,
  ) {
    // Don't nag with "but these are recommended" when the slot already has a top-tier enchant; only
    // surface the recommended best-in-slot enchant when the slot is missing or under-enchanted.
    if (this.hasEnchant(item) && this.hasMaxEnchant(item)) {
      return super.boxRowTooltip(item, slotName, undefined);
    }
    return super.boxRowTooltip(item, slotName, recommendedEnchantments);
  }
}

export default EnchantChecker;
