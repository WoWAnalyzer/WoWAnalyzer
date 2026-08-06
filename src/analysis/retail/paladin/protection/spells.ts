import GeneratedSpells from './spell-list_Paladin_Protection.retail';
import type { RetailSpell } from 'wow-dbc';

/**
 * Corrections to the generated list.
 *
 * The generator picks up the baseline Hammer of Wrath (24275), which is what
 * Retribution casts. Protection casts 1241413 - in a 12.0.7 log the Protection
 * paladin emits 1241413 exclusively and 24275 never, while the Retribution paladin
 * in the same group emits 24275. Registering the wrong id puts every Hammer of
 * Wrath on SpellUsable's "used but is not in spellbook" path, so it gets no
 * cooldown tracking and no cast efficiency.
 *
 * Kept here rather than in the generated file so it survives regeneration.
 */
const corrections = {
  HAMMER_OF_WRATH: { ...GeneratedSpells.HAMMER_OF_WRATH, id: 1241413 },
} as const;

/**
 * Spells the generator does not emit but that Protection casts. Hammer of Light replaces
 * Shield of the Righteous under Lights Guidance (Templar); it is gated in gen.ts rather
 * than here because the generated data has no talent entry for it.
 */
const extraSpells = {
  HAMMER_OF_LIGHT: {
    id: 427453,
    type: 'baseline',
    passive: false,
    name: 'Hammer of Light',
    gcd: { duration: 1500, hasted: true },
    icon: 'inv_mace_1h_gryphonrider_d_02_silver.jpg',
  },
} as const satisfies Record<string, RetailSpell & { icon: string }>;

const spells = { ...GeneratedSpells, ...corrections, ...extraSpells } as const;
export type Spells = typeof spells;
export default spells;
