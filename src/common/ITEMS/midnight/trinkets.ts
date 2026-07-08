import Item from '../Item';

const trinkets = {
  VOLATILE_VOID_SUFFUSER: {
    id: 249341,
    name: 'Volatile Void Suffuser',
    icon: 'inv_12_trinket_raid_voidspire_healer1_volatilevoidsuffuser',
  },
  LIGHT_OF_THE_COSMIC_CRESCENDO: {
    id: 249811,
    name: 'Light of the Cosmic Crescendo',
    icon: 'inv_12_trinket_raid_darkwelle_healer3_cosmiccrescendo',
  },
  FREIGHTRUNNERS_FLASK: {
    id: 250215,
    name: 'Freightrunners Flask',
    icon: 'inv_alchemy_90_flask_red',
  },
} satisfies Record<string, Item>;

export default trinkets;
