import React from 'react';
import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';


class CastEfficiency extends CoreCastEfficiency {
    static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,

      {
        spell: SPELLS.ICEBOUND_FORTITUDE,
        importance: ISSUE_IMPORTANCE.MINOR,
        category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
        getCooldown: haste => 180,
        recommendedCastEfficiency: 0.75,
        extraSuggestion: <span>A big CD. Use it to negate big hits that last for more than a couple of seconds.</span>,

      },
      {
        spell: SPELLS.VAMPIRIC_BLOOD,
        importance: ISSUE_IMPORTANCE.MINOR,
        category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
        getCooldown: haste => 90,
        recommendedCastEfficiency: 0.75,
        extraSuggestion: <span>Use this ability regularly to reduce the strain on your healers. Save it for a big hit if needed.</span>,
      },

      {
        spell: SPELLS.BLOOD_MIRROR,
        importance: ISSUE_IMPORTANCE.MINOR,
        category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
        getCooldown: haste => 120,
        recommendedCastEfficiency: 0.75,
        isActive: combatant => combatant.hasTalent(SPELLS.BLOOD_MIRROR_TALENT.id),
        extraSuggestion: <span>Provides both damage and mitigation, use it as regularly as possible.</span>,
      },

      {
        spell: SPELLS.BLOOD_BOIL,
        category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
        getCooldown: haste => 7.5 / (1 + haste),
        recommendedCastEfficiency: 0.95,
        extraSuggestion: <span>Try to keep at least one charge of this ability on cooldown.</span>,
      },
      {
        spell: SPELLS.CONSUMPTION,
        category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
        getCooldown: haste => 45,
        recommendedCastEfficiency: 0.95,
        extraSuggestion: <span>Use this on cooldown unless you require the leech for a specific moment, such as add spawns.</span>,
      },

      {
        spell: SPELLS.DANCING_RUNE_WEAPON,
        category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
        getCooldown: haste => 180,
        recommendedCastEfficiency: 0.75,
        extraSuggestion: <span>Use this ability on the pull, and then on cooldown.</span>,
      },

      {
        spell: SPELLS.BLOODDRINKER,
        category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
        getCooldown: haste => 30,
        recommendedCastEfficiency: 0.85,
        isActive: combatant => combatant.hasTalent(SPELLS.BLOODDRINKER_TALENT.id),
        extraSuggestion: <span>Use this on cooldown, you can also save it for a small time in case you need ranged damage.</span>,
      },


      {
        spell: SPELLS.ARCANE_TORRENT,
        category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
        getCooldown: haste => 90,
        hideWithZeroCasts: true,
      },
    ];
}

export default CastEfficiency;
