import type { RetailSpell } from 'wow-dbc';
import type { SpellbookAbility } from './Ability';
import type Combatant from '../Combatant';
import Abilities from './Abilities';
import SPELL_CATEGORY from '../SPELL_CATEGORY';
import { Options } from '../Analyzer';
import { registerSpell as registerClassicSpell } from 'common/SPELLS/classic';
import { registerSpell as registerRetailSpell } from 'common/SPELLS';
import GameBranch from 'game/GameBranch';
import { applyModifiers } from 'wow-dbc/dist/src/hydraters/effects';

export type GenSpell = RetailSpell & { icon: string };
export type GenTalent = GenSpell & { type: 'talent' };

export interface GenAbilityConfig {
  allSpells: GenSpell[] | Record<string, GenSpell>;
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
  const allSpells = toSpellIdMap(config.allSpells);
  return class extends Abilities {
    constructor(options: Options) {
      super(options);

      const branch = this.owner.config.branch;

      const register = branch === GameBranch.Retail ? registerRetailSpell : registerClassicSpell;

      for (const spell of Object.values(allSpells)) {
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

      const others = Object.values(allSpells)
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
  const isKnown = (id: number) =>
    allSpells[id] && checkEnabled(allSpells[id], combatant, allSpells);
  return {
    spell: spell.id,
    name: spell.name,
    category: category,
    gcd: spellGcd(spell, isKnown),
    cooldown: spellCooldown(spell, isKnown),
    charges: spellCharges(spell, isKnown),
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

  if (spell.type === 'talent') {
    return combatant.hasTalent(spell);
  }

  if (spell.type === 'temporary') {
    const source = allSpells[spell.grantedBy];
    if (source.type === 'glyph') {
      return combatant.hasGlyph(source.glyphId);
    } else {
      return source.passive && checkEnabled(source, combatant, allSpells);
    }
  }

  // check if another spell overrides this one *and* is statically enabled
  for (const other of Object.values(allSpells)) {
    if (
      other.overrides === spell.id &&
      // if a spell is both granted by and overrides the same spell, don't check it.
      // this prevents infinite recursion.
      // an example of this is the Flying Serpent Kick slam that you can use while using FSK.
      (!('grantedBy' in other) || other.grantedBy !== spell.id) &&
      checkEnabled(other, combatant, allSpells)
    ) {
      return false;
    }
  }

  return true;
}

type KnownSpellCheck = (spellId: number) => boolean;

function spellGcd(spell: GenSpell, isKnown: KnownSpellCheck): SpellbookAbility['gcd'] {
  if (!spell.gcd) {
    return null;
  }

  const gcd = applyModifiers(spell.gcd, isKnown);

  if (gcd.hasted) {
    return {
      base: gcd.duration,
    };
  }

  return {
    static: gcd.duration,
  };
}

function spellCooldown(spell: GenSpell, isKnown: KnownSpellCheck): SpellbookAbility['cooldown'] {
  if (!spell.cooldown) {
    return undefined;
  }

  const cooldown = applyModifiers(spell.cooldown, isKnown);

  const duration = cooldown.duration / 1000;

  if (cooldown.hasted) {
    return (haste: number) => duration / (1 + haste);
  }

  return duration;
}

function spellCharges(spell: GenSpell, isKnown: KnownSpellCheck): SpellbookAbility['charges'] {
  if (!spell.charges) {
    return undefined;
  }

  const charges = applyModifiers(spell.charges, isKnown);

  return charges.max;
}

function toSpellIdMap(spells: GenAbilityConfig['allSpells']): Record<number, GenSpell> {
  if (!Array.isArray(spells)) {
    spells = Object.values(spells);
  }

  return Object.fromEntries(spells.map((spell) => [spell.id, spell]));
}
