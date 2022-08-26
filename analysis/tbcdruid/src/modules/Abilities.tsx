import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells: SpellbookAbility[] = [
      {
        spell: [SPELLS.ABOLISH_POISON],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.AQUATIC_FORM],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.BARKSKIN],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.BASH, ...lowRankSpells[SPELLS.BASH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.BEAR_FORM],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CAT_FORM],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CHALLENGING_ROAR],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CLAW, ...lowRankSpells[SPELLS.CLAW]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.COWER, ...lowRankSpells[SPELLS.COWER]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CURE_POISON],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CYCLONE],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DASH],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DEMORALIZING_ROAR, ...lowRankSpells[SPELLS.DEMORALIZING_ROAR]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DIRE_BEAR_FORM],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.ENRAGE],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.ENTANGLING_ROOTS, ...lowRankSpells[SPELLS.ENTANGLING_ROOTS]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FAERIE_FIRE, ...lowRankSpells[SPELLS.FAERIE_FIRE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FELINE_GRACE],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FEROCIOUS_BITE, ...lowRankSpells[SPELLS.FEROCIOUS_BITE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FLIGHT_FORM],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FRENZIED_REGENERATION, ...lowRankSpells[SPELLS.FRENZIED_REGENERATION]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.GIFT_OF_THE_WILD, ...lowRankSpells[SPELLS.GIFT_OF_THE_WILD]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.GROWL],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HEALING_TOUCH, ...lowRankSpells[SPELLS.HEALING_TOUCH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HIBERNATE, ...lowRankSpells[SPELLS.HIBERNATE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HURRICANE, ...lowRankSpells[SPELLS.HURRICANE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.INNERVATE],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.LACERATE],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.LIFEBLOOM],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MAIM],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MANGLE_BEAR, ...lowRankSpells[SPELLS.MANGLE_BEAR]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MANGLE_CAT, ...lowRankSpells[SPELLS.MANGLE_CAT]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MARK_OF_THE_WILD, ...lowRankSpells[SPELLS.MARK_OF_THE_WILD]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MAUL, ...lowRankSpells[SPELLS.MAUL]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MOONFIRE, ...lowRankSpells[SPELLS.MOONFIRE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.POUNCE, ...lowRankSpells[SPELLS.POUNCE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.PROWL, ...lowRankSpells[SPELLS.PROWL]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.RAKE, ...lowRankSpells[SPELLS.RAKE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.RAVAGE, ...lowRankSpells[SPELLS.RAVAGE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.REBIRTH, ...lowRankSpells[SPELLS.REBIRTH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.REGROWTH, ...lowRankSpells[SPELLS.REGROWTH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.REJUVENATION, ...lowRankSpells[SPELLS.REJUVENATION]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.REMOVE_CURSE],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.RIP, ...lowRankSpells[SPELLS.RIP]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SHRED, ...lowRankSpells[SPELLS.SHRED]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SOOTHE_ANIMAL, ...lowRankSpells[SPELLS.SOOTHE_ANIMAL]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.STARFIRE, ...lowRankSpells[SPELLS.STARFIRE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SWIFT_FLIGHT_FORM],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SWIPE, ...lowRankSpells[SPELLS.SWIPE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.TELEPORT_MOONGLADE],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.THORNS, ...lowRankSpells[SPELLS.THORNS]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.TIGERS_FURY, ...lowRankSpells[SPELLS.TIGERS_FURY]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.TRACK_HUMANOIDS],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.TRANQUILITY, ...lowRankSpells[SPELLS.TRANQUILITY]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.TRAVEL_FORM],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.WRATH, ...lowRankSpells[SPELLS.WRATH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
    ];

    return baseSpells;
  }
}

export default Abilities;
