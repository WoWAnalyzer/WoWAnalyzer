import type { RetailSpell } from 'wow-dbc';
import type { SpellbookAbility } from './Ability';
import type Combatant from '../Combatant';
import Abilities from './Abilities';
import SPELL_CATEGORY from '../SPELL_CATEGORY';

export interface GenAbilityConfig {
  allSpells: RetailSpell[];
  rotational: RetailSpell[];
  cooldowns: RetailSpell[];
  defensives: RetailSpell[];
  overrides?: { [id: number]: (combatant: Combatant) => SpellbookAbility };
}

export default function genAbilities(config: GenAbilityConfig): typeof Abilities {
  const spells = config.rotational
    .map((spell) => spellbookDefinition(spell, SPELL_CATEGORY.ROTATIONAL))
    .concat(config.cooldowns.map((spell) => spellbookDefinition(spell, SPELL_CATEGORY.COOLDOWNS)))
    .concat(config.defensives.map((spell) => spellbookDefinition(spell, SPELL_CATEGORY.DEFENSIVE)));

  const configuredSpells = new Set(
    spells.map((spell) => spell.spell).concat(Object.keys(config.overrides ?? {}).map(Number)),
  );

  const others = config.allSpells
    .filter((spell) => !configuredSpells.has(spell.id) && !spell.hidden && !spell.passive)
    .map((spell) => spellbookDefinition(spell, SPELL_CATEGORY.OTHERS));

  return class extends Abilities {
    spellbook() {
      return [
        ...spells,
        ...others,
        ...Object.values(config.overrides ?? {}).map((fn) => fn(this.selectedCombatant)),
      ];
    }
  };
}

function spellbookDefinition(spell: RetailSpell, category: SPELL_CATEGORY): SpellbookAbility {
  return {
    spell: spell.id,
    category: category,
    gcd: spellGcd(spell),
    cooldown: spellCooldown(spell),
    castEfficiency: {},
  };
}

function spellGcd(spell: RetailSpell): SpellbookAbility['gcd'] {
  if (!spell.gcd) {
    return null;
  }

  if (spell.gcd.hasted) {
    // TODO talent modifiers etc. more relevant for retail
    return {
      base: spell.gcd.duration,
    };
  }

  return {
    static: spell.gcd.duration,
  };
}

function spellCooldown(spell: RetailSpell): SpellbookAbility['cooldown'] {
  if (!spell.cooldown) {
    return undefined;
  }

  const duration = spell.cooldown.duration / 1000;

  if (spell.cooldown.hasted) {
    return (haste: number) => duration / haste;
  }

  return duration;
}
