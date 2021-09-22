import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells: SpellbookAbility[] = [
      {
        spell: [SPELLS.ABOLISH_POISON],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.AQUATIC_FORM],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.BARKSKIN],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.BASH, ...lowRankSpells[SPELLS.BASH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.BEAR_FORM],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CAT_FORM],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CHALLENGING_ROAR],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CLAW, ...lowRankSpells[SPELLS.CLAW]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.COWER, ...lowRankSpells[SPELLS.COWER]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CURE_POISON],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CYCLONE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DASH],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DEMORALIZING_ROAR, ...lowRankSpells[SPELLS.DEMORALIZING_ROAR]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DIRE_BEAR_FORM],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.ENRAGE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.ENTANGLING_ROOTS, ...lowRankSpells[SPELLS.ENTANGLING_ROOTS]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FAERIE_FIRE, ...lowRankSpells[SPELLS.FAERIE_FIRE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FELINE_GRACE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FEROCIOUS_BITE, ...lowRankSpells[SPELLS.FEROCIOUS_BITE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FLIGHT_FORM],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FRENZIED_REGENERATION, ...lowRankSpells[SPELLS.FRENZIED_REGENERATION]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.GIFT_OF_THE_WILD, ...lowRankSpells[SPELLS.GIFT_OF_THE_WILD]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.GROWL],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HEALING_TOUCH, ...lowRankSpells[SPELLS.HEALING_TOUCH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HIBERNATE, ...lowRankSpells[SPELLS.HIBERNATE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HURRICANE, ...lowRankSpells[SPELLS.HURRICANE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.INNERVATE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.LACERATE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.LIFEBLOOM],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MAIM],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MANGLE_BEAR, ...lowRankSpells[SPELLS.MANGLE_BEAR]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MANGLE_CAT, ...lowRankSpells[SPELLS.MANGLE_CAT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MARK_OF_THE_WILD, ...lowRankSpells[SPELLS.MARK_OF_THE_WILD]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MAUL, ...lowRankSpells[SPELLS.MAUL]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MOONFIRE, ...lowRankSpells[SPELLS.MOONFIRE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.POUNCE, ...lowRankSpells[SPELLS.POUNCE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.PROWL, ...lowRankSpells[SPELLS.PROWL]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.RAKE, ...lowRankSpells[SPELLS.RAKE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.RAVAGE, ...lowRankSpells[SPELLS.RAVAGE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.REBIRTH, ...lowRankSpells[SPELLS.REBIRTH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.REGROWTH, ...lowRankSpells[SPELLS.REGROWTH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.REJUVENATION, ...lowRankSpells[SPELLS.REJUVENATION]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.REMOVE_CURSE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.RIP, ...lowRankSpells[SPELLS.RIP]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SHRED, ...lowRankSpells[SPELLS.SHRED]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SOOTHE_ANIMAL, ...lowRankSpells[SPELLS.SOOTHE_ANIMAL]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.STARFIRE, ...lowRankSpells[SPELLS.STARFIRE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SWIFT_FLIGHT_FORM],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SWIPE, ...lowRankSpells[SPELLS.SWIPE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.TELEPORT_MOONGLADE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.THORNS, ...lowRankSpells[SPELLS.THORNS]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.TIGERS_FURY, ...lowRankSpells[SPELLS.TIGERS_FURY]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.TRACK_HUMANOIDS],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.TRANQUILITY, ...lowRankSpells[SPELLS.TRANQUILITY]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.TRAVEL_FORM],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.WRATH, ...lowRankSpells[SPELLS.WRATH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
    ];

    return baseSpells;
  }
}

export default Abilities;
