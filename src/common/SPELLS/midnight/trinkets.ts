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
} satisfies Record<string, Spell>;

export default spells;
