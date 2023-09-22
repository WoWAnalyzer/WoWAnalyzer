import Spell from '../Spell';

const spells = {
  // -----------------
  // PHASE 2 - ULDUAR
  // -----------------
  // Ignis
  SLAG_IMBUED: {
    id: 63536,
    name: 'Slag Imbued',
    icon: 'spell_fire_lavaspawn',
  },
  // Hodir
  STARLIGHT: {
    id: 62807,
    name: 'Starlight',
    icon: 'spell_holy_elunesgrace',
  },
  // Freya
  ATTUNED_TO_NATURE: {
    id: 62519,
    name: 'Attuned to Nature',
    icon: 'ability_druid_giftoftheearthmother',
  },
  // Mimiron
  PLASMA_BALL: {
    id: 65648,
    name: 'Plasma Ball',
    icon: 'spell_arcane_arcane04',
  },
  // General Vezax
  SHADOW_CRASH: {
    id: 64775,
    name: 'Shadow Crash',
    icon: 'spell_shadow_painspike',
  },
  // Yogg-Saron
  SHADOWY_BARRIER_YOGG: {
    id: 63894,
    name: 'Shadowy Barrier',
    icon: 'spell_shadow_soulgem',
  },
} satisfies Record<string, Spell>;

export default spells;
