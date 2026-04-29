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
} satisfies Record<string, Spell>;

export default spells;
