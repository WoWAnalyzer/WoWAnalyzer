import Spell from '../Spell';

const spells = {
  EYE_OF_THE_DROWNING_VOID: {
    id: 1255476,
    name: 'Eye of the Drowning Void',
    icon: 'inv_archaeology_70_tauren_moosebonefishhook.jpg',
  },
  VOID_SUFFUSION: {
    id: 1258534,
    name: 'Void Suffusion',
    icon: 'inv_12_trinket_raid_voidspire_healer1_volatilevoidsuffuser',
  },
  COSMIC_CRESCENDO: {
    id: 1264948,
    name: 'Cosmic Crescendo',
    icon: 'inv_12_trinket_raid_darkwelle_healer3_cosmiccrescendo',
  },
  COSMIC_HYMN: {
    id: 1265019,
    name: 'Cosmic Hymn',
    icon: 'inv_12_trinket_raid_darkwelle_healer3_cosmiccrescendo',
  },
  FANATICAL_INSPIRATION: {
    id: 1266299,
    name: 'Fanatical Inspiration',
    icon: 'inv_12_trinket_gloriuscrusaderskeepsake',
  },
  FREIGHTRUNNERS_FLASK: {
    id: 1250533,
    name: 'Freightrunners Flask',
    icon: 'inv_alchemy_90_flask_red',
  },
  AKILZONS_CLARITY: {
    id: 1247577,
    name: "Akilzon's Clarity",
    icon: 'inv_archaeology_70_tauren_drum',
  },
  LIGHTS_BLESSING: {
    id: 1263768,
    name: "Light's Blessing",
    icon: 'inv_lightforgedmatrixability_lightsjudgment',
  },
} satisfies Record<string, Spell>;

export default spells;
