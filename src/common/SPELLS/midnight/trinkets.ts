import Spell from '../Spell';
const spells = {
  // Algeth'ar Puzzle Box ΓÇö on-use Mastery buff (carried from Dragonflight M+)
  ALGETHAR_PUZZLE: {
    id: 383781,
    name: "Algeth'ar Puzzle",
    icon: 'inv_inscription_darkmoondeck_prism',
  },
  // Emberwing Feather ΓÇö on-use Haste buff from Windrunner Spire
  EMBERWING_HEATWAVE: {
    id: 1250508,
    name: 'Emberwing Heatwave',
    icon: 'inv_12_trinket_dungeon_windrunner_emberwingfeather',
  },
  // Umbral Plume ΓÇö passive Crit proc from Dreamrift
  UMBRAL_PLUME_BUFF: {
    id: 1265809,
    name: 'Umbral Plume',
    icon: 'inv_feather_13',
  },
  // Radiant Plume ΓÇö alternate form of Umbral Plume
  RADIANT_PLUME_BUFF: {
    id: 1265806,
    name: 'Radiant Plume',
    icon: 'inv_feather_13',
  },
  // Gaze of the Alnseer ΓÇö passive primary stat proc from Dreamrift (Chimaerus)
  GAZE_OF_THE_ALNSEER: {
    id: 1256896,
    name: 'Gaze of the Alnseer',
    icon: 'inv_12_trinket_raid_dreamrift_gazeofthealnseer',
  },
  // Light Company Guidon ΓÇö Voidspire (Imperator Averzian)
  LIGHT_COMPANY_GUIDON: {
    id: 1251817,
    name: 'Light Company Guidon',
    icon: 'inv_12_trinket_raid_voidspire_lightcompanyguidon',
  },
  // Eye of the Drowning Void ΓÇö already existed, keeping for completeness
  EYE_OF_THE_DROWNING_VOID: {
    id: 1255476,
    name: 'Eye of the Drowning Void',
    icon: 'inv_archaeology_70_tauren_moosebonefishhook.jpg',
  },
} satisfies Record<string, Spell>;
export default spells;
