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
  const allSpells = Object.fromEntries(config.allSpells.map((spell) => [spell.id, spell]));
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
          spellbookDefinition(this.selectedCombatant, spell, SPELL_CATEGORY.ROTATIONAL, allSpells),
        )
        .concat(
          config.cooldowns.map((spell) =>
            spellbookDefinition(this.selectedCombatant, spell, SPELL_CATEGORY.COOLDOWNS, allSpells),
          ),
        )
        .concat(
          config.defensives.map((spell) =>
            spellbookDefinition(this.selectedCombatant, spell, SPELL_CATEGORY.DEFENSIVE, allSpells),
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
        .map((spell) =>
          spellbookDefinition(this.selectedCombatant, spell, SPELL_CATEGORY.OTHERS, allSpells),
        );

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
  allSpells: Record<number, GenSpell>,
): SpellbookAbility {
  return {
    spell: spell.id,
    name: spell.name,
    category: category,
    gcd: spellGcd(spell),
    cooldown: spellCooldown(spell),
    charges: spellCharges(spell),
    castEfficiency: {},
    enabled: checkEnabled(spell, combatant, allSpells),
  };
}

function checkEnabled(
  spell: GenSpell,
  combatant: Combatant,
  allSpells: Record<number, GenSpell>,
): boolean {
  if (spell.type === 'mists-talent') {
    return combatant.hasClassicTalent(spell.id);
  }

  if (spell.type === 'temporary') {
    const source = allSpells[spell.grantedBy];
    if (source.type === 'glyph') {
      return combatant.hasGlyph(source.glyphId);
    }
  }

  // check if another spell overrides this one *and* is statically enabled
  for (const other of Object.values(allSpells)) {
    if (other.overrides === spell.id && checkEnabled(other, combatant, allSpells)) {
      return false;
    }
  }

  return true;
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
