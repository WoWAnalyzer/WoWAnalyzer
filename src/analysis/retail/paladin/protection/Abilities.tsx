import { GenAbilities } from './gen';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { SpellbookAbility } from 'parser/core/modules/Ability';

export class Abilities extends GenAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells = super.spellbook();
    const combatant = this.selectedCombatant;
    const missingSpells: SpellbookAbility[] = [];

    // ----- Sacred Weapon (Holy Armaments) -----
    /*if (combatant.hasTalent(TALENTS.HOLY_ARMAMENTS_TALENT)) {
      let baseCD = 60;
      baseCD -= (combatant.getTalentRank(TALENTS.FOREWARNING_TALENT) * 12);
      baseCD -= (combatant.getTalentRank(TALENTS.QUICKENED_INVOCATION_TALENT) * 15);
      baseCD = Math.max(0, baseCD);
      missingSpells.push({
        spell: [TALENTS.HOLY_ARMAMENTS_TALENT.id, SPELLS.SACRED_WEAPON_TALENT.id],
        name: SPELLS.SACRED_WEAPON_TALENT.name,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: baseCD,
        gcd: { base: 1500 },
        charges: 2,
        enabled: true,
      });
    }*/

    return [...baseSpells, ...missingSpells];
  }
}
