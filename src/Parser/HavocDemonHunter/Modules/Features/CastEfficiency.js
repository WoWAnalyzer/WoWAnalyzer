import React from 'react';
import SPELLS from 'common/SPELLS';
import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.FELBLADE_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 10 / (1 + haste),
      recommendedCastEfficiency: 0.95,
      extraSuggestion: <span>This is your main Fury filler spell. Try to always cast it on cooldown. It can be used to charge to the desired target too, making it very strong movimentation spell. </span>,
    },
    {
      spell: SPELLS.FURY_OF_THE_ILLIDARI,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      recommendedCastEfficiency: 0.9,
      extraSuggestion: <span>This does a huge ammount of AoE passive damage and it's one of the main damage spells for Havoc Demon Hunters. You should cast it as soon as it become available. The only moment you can delay it's cast is if you already expect an add wave to maximize it's efficiency and damage output.  </span>,
    },
    {
      spell: SPELLS.EYE_BEAM,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 45,
      recommendedCastEfficiency: 0.85,
      extraSuggestion: <span>This is a great AoE damage spell, but also does a great damage on single target. You should cast it as soon as it gets off cooldown. The only moment you can delay it's cast is if you already expect an add wave to maximize it's efficiency and damage output. </span>,
    },
    {
      spell: SPELLS.NEMESIS_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.NEMESIS_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      recommendedCastEfficiency: 0.95,
      extraSuggestion: <span>This is your main damage increase buff. You should use it as much as you can to maximize your damage output. </span>,
    },
    {
      spell: SPELLS.MOMENTUM_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 10,
      recommendedCastEfficiency: 0.95,
      extraSuggestion: <span>This is your main damage increase buff. You should use it as much as you can to maximize your damage output. </span>,
    },
    {
      spell: SPELLS.FEL_ERUPTION_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.FEL_ERUPTION_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      recommendedCastEfficiency: 0.95,
      extraSuggestion: <span>This is a great Chaos burst damage spell and it does a huge single target DPS increase by just 10 Fury per cast. Should definitively be used as soon as it gets available. </span>,
    },
    {
      spell: SPELLS.FEL_BARRAGE_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.FEL_BARRAGE_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      recommendedCastEfficiency: 0.85,
      extraSuggestion: <span>This is a great AoE damage spell, but also does a great damage on single target. You should cast it as soon as it gets off cooldown. The only moment you can delay it's cast is if you already expect an add wave to maximize it's efficiency and damage output. </span>,
    },
  ];
}

export default CastEfficiency;
