import Item from '../Item';
const trinkets = {
  // Carried from Dragonflight M+ ΓÇö still BiS on-use for MM Hunter S1
  ALGETHAR_PUZZLE_BOX: {
    id: 193701,
    name: "Algeth'ar Puzzle Box",
    icon: 'inv_inscription_darkmoondeck_prism',
  },
  // Midnight Season 1 ΓÇö Dreamrift (Chimaerus)
  GAZE_OF_THE_ALNSEER: {
    id: 249343,
    name: 'Gaze of the Alnseer',
    icon: 'inv_12_trinket_raid_dreamrift_gazeofthealnseer',
  },
  // Midnight Season 1 ΓÇö Dreamrift (Void Ember / Light Ember)
  UMBRAL_PLUME: {
    id: 260235,
    name: 'Umbral Plume',
    icon: 'inv_feather_13',
  },
  RADIANT_PLUME: {
    id: 249806,
    name: 'Radiant Plume',
    icon: 'inv_feather_13',
  },
  // Midnight Season 1 ΓÇö Windrunner Spire (Emberdawn)
  EMBERWING_FEATHER: {
    id: 250144,
    name: 'Emberwing Feather',
    icon: 'inv_12_trinket_dungeon_windrunner_emberwingfeather',
  },
  // Midnight Season 1 ΓÇö Voidspire (Imperator Averzian)
  LIGHT_COMPANY_GUIDON: {
    id: 249344,
    name: 'Light Company Guidon',
    icon: 'inv_12_trinket_raid_voidspire_lightcompanyguidon',
  },
} satisfies Record<string, Item>;
export default trinkets;
