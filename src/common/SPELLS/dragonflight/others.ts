import Spell from '../Spell';

const others = {
  DRACONIC_AUGMENT_RUNE: {
    id: 393438,
    name: 'Draconic Augment Rune',
    icon: 'inv_10_jewelcrafting3_rainbowprism_color2',
  },
  POWER_BEYOND_IMAGINATION: {
    id: 409447,
    name: 'Power Beyond Imagination',
    icon: 'inv_cosmicvoid_debuff',
  },
  USURPED_FROM_BEYOND: {
    id: 409449,
    name: 'Usurped from Beyond',
    icon: 'inv_cosmicvoid_debuff',
  },
  // 'Disintegrate' ability from The Forgotten Experiements encounter
  RIONTHUS_DISINTEGRATE: {
    id: 405457,
    name: 'Disintegrate',
    icon: 'ability_evoker_disintegrate',
  },
  RAGE_OF_FYRALATH_1: {
    id: 417131,
    name: "Rage of Fyr'alath",
    icon: 'inv_axe_2h_fyrakk_d_01_shadowflame',
  },
  RAGE_OF_FYRALATH_2: {
    id: 417132,
    name: "Rage of Fyr'alath",
    icon: 'inv_axe_2h_fyrakk_d_01_shadowflame',
  },
  RAGE_OF_FYRALATH_DAMAGE_1: {
    id: 417134,
    name: "Rage of Fyr'alath",
    icon: 'inv_axe_2h_fyrakk_d_01_shadowflame',
  },
  RAGE_OF_FYRALATH_DAMAGE_2: {
    id: 424094,
    name: "Rage of Fyr'alath",
    icon: 'inv_axe_2h_fyrakk_d_01_shadowflame',
  },
  IRIDAL_EXTINCTION_BLAST_DAMAGE: {
    id: 419278,
    name: 'Extinction Blast',
    icon: 'inv_staff_2h_blackdragonoutdoor_d_01',
  },
  DREAMBINDER_WEB_OF_DREAMS_DAMAGE: {
    id: 427113,
    name: 'Web of Dreams',
    icon: 'inv_staff_2h_dreamweaver_d_01',
  },
} satisfies Record<string, Spell>;

export default others;
