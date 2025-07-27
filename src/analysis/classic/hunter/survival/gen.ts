import type { RetailSpell } from 'wow-dbc';
import spells from './spell-list_Hunter_Survival.classic';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import Combatant from 'parser/core/Combatant';

const rotational = [
  spells.KILL_SHOT,
  spells.COBRA_SHOT,
  spells.EXPLOSIVE_SHOT,
  spells.BLACK_ARROW,
  spells.EXPLOSIVE_TRAP,
  spells.EXPLOSIVE_TRAP_TRAP_LAUNCHER,
  spells.ARCANE_SHOT,
  spells.SERPENT_STING,
  spells.FERVOR,
  spells.MULTI_SHOT,
  spells.GLAIVE_TOSS_3,
];

const cooldowns = [spells.STAMPEDE, spells.RAPID_FIRE, spells.A_MURDER_OF_CROWS];

const defensives = [spells.DETERRENCE];

interface GenAbilityConfig {
  allSpells: RetailSpell[];
  rotational: RetailSpell[];
  cooldowns: RetailSpell[];
  defensives: RetailSpell[];
  overrides?: { [id: number]: (combatant: Combatant) => SpellbookAbility };
}

function genAbilities(config: GenAbilityConfig): typeof Abilities {
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

export const GenAbilities = genAbilities({
  allSpells: Object.values(spells) as RetailSpell[],
  rotational,
  cooldowns,
  defensives,
});

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
