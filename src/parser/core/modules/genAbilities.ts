import type { RetailSpell } from 'wow-dbc';
import type { SpellbookAbility } from './Ability';
import type Combatant from '../Combatant';
import Abilities from './Abilities';
import SPELL_CATEGORY from '../SPELL_CATEGORY';
import { Options } from '../Analyzer';
import { registerSpell as registerClassicSpell } from 'common/SPELLS/classic';
import { registerSpell as registerRetailSpell } from 'common/SPELLS';
import GameBranch from 'game/GameBranch';

export type GenSpell = RetailSpell & { icon: string };

export interface GenAbilityConfig {
  allSpells: GenSpell[];
  rotational: GenSpell[];
  cooldowns: GenSpell[];
  defensives: GenSpell[];
  overrides?: Record<
    number,
    (combatant: Combatant, generated?: SpellbookAbility) => SpellbookAbility
  >;
  /**
   * Spells to be omitted from abilities. Typically, these are added externally (such as by ExecuteHelper).
   */
  omit?: GenSpell[];
}

export default function genAbilities(config: GenAbilityConfig): typeof Abilities {
  return class extends Abilities {
    constructor(options: Options) {
      super(options);

      const branch = this.owner.config.branch;

      const register = branch === GameBranch.Retail ? registerRetailSpell : registerClassicSpell;

      for (const spell of config.allSpells) {
        register(spell.id, spell.name, spell.icon);
      }
    }
    spellbook() {
      const spells = config.rotational
        .map((spell) =>
          spellbookDefinition(this.selectedCombatant, spell, SPELL_CATEGORY.ROTATIONAL),
        )
        .concat(
          config.cooldowns.map((spell) =>
            spellbookDefinition(this.selectedCombatant, spell, SPELL_CATEGORY.COOLDOWNS),
          ),
        )
        .concat(
          config.defensives.map((spell) =>
            spellbookDefinition(this.selectedCombatant, spell, SPELL_CATEGORY.DEFENSIVE),
          ),
        );

      const configuredSpells = new Set(
        spells.map((spell) => spell.spell).concat(Object.keys(config.overrides ?? {}).map(Number)),
      );

      const omitted = new Set(config.omit?.map((spell) => spell.id));

      const others = config.allSpells
        .filter(
          (spell) =>
            !configuredSpells.has(spell.id) &&
            !spell.hidden &&
            !spell.passive &&
            !omitted.has(spell.id),
        )
        .map((spell) => spellbookDefinition(this.selectedCombatant, spell, SPELL_CATEGORY.OTHERS));

      return [
        ...spells.filter((spell) => !config.overrides?.[spell.spell as number]),
        ...others.filter((spell) => !config.overrides?.[spell.spell as number]),
        ...Object.entries(config.overrides ?? {}).map(([key, fn]) =>
          fn(
            this.selectedCombatant,
            spells.find((spell) => spell.spell === Number(key)) ??
              others.find((spell) => spell.spell === Number(key)),
          ),
        ),
      ];
    }
  };
}

function spellbookDefinition(
  combatant: Combatant,
  spell: GenSpell,
  category: SPELL_CATEGORY,
): SpellbookAbility {
  return {
    spell: spell.id,
    name: spell.name,
    category: category,
    gcd: spellGcd(spell),
    cooldown: spellCooldown(spell),
    charges: spellCharges(spell),
    castEfficiency: {},
    enabled: spell.type === 'mists-talent' ? combatant.hasClassicTalent(spell.id) : true,
  };
}

function spellGcd(spell: GenSpell): SpellbookAbility['gcd'] {
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

function spellCooldown(spell: GenSpell): SpellbookAbility['cooldown'] {
  if (!spell.cooldown) {
    return undefined;
  }

  const duration = spell.cooldown.duration / 1000;

  if (spell.cooldown.hasted) {
    return (haste: number) => duration / haste;
  }

  return duration;
}

function spellCharges(spell: GenSpell): SpellbookAbility['charges'] {
  if (!spell.charges) {
    return undefined;
  }

  return spell.charges.max;
}
