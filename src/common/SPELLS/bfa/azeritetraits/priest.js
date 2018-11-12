/**
 * All Priest azerite powers go in here.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Disc
  GIFT_OF_FORGIVENESS: {
    id: 277680,
    name: 'Gift of the Forgiveness',
    icon: 'spell_holy_holysmite',
  },
  ENDURING_LUMINESCENCE: {
    id: 278643,
    name: 'Enduring Luminescence',
    icon: 'spell_priest_power-word',
  },
  // Holy
  BLESSED_SANCTUARY: {
    id: 273313,
    name: 'Blessed Sanctuary',
    icon: 'spell_holy_divineprovidence',
  },
  EVERLASTING_LIGHT: {
    id: 277681,
    name: 'Everlasting Light',
    icon: 'spell_holy_greaterheal',
  },
  PERMEATING_GLOW_TALENT: {
    id: 272780,
    name: 'Permeating Glow',
    icon: 'spell_holy_flashheal',
  },
  PERMEATING_GLOW_BUFF: {
    id: 272783,
    name: 'Permeating Glow',
    icon: 'spell_holy_flashheal',
  },
  PRAYERFUL_LITANY: {
    id: 275602,
    name: 'Prayerful Litany',
    icon: 'spell_holy_prayerofhealing02',
  },
  SACRED_FLAME: {
    id: 278655,
    name: 'Sacred Flame',
    icon: 'spell_holy_searinglight',
  },
  WORD_OF_MENDING: {
    id: 278645,
    name: 'Word of Mending',
    icon: 'spell_holy_prayerofmendingtga',
  },
  // Shadow
  // All
  SANCTUM_TRAIT: {
    id: 274366,
    name: 'Sanctum',
    icon: 'spell_magic_lesserinvisibilty',
  },
  /*SANCTUM_ABSORB: {
    id: 274368,
    name: 'Sanctum',
    icon: 'spell_magic_lesserinvisibilty',
  },*/
  SANCTUM_ABSORB: {
    id: 274369,
    name: 'Sanctum',
    icon: 'spell_magic_lesserinvisibilty',
  },
  TWIST_MAGIC_TRAIT: {
    id: 280018,
    name: 'Twist Magic',
    icon: 'spell_nature_nullifydisease',
  },
  TWIST_MAGIC_HEAL: {
    id: 280198,
    name: 'Twist Magic',
    icon: 'spell_nature_nullifydisease',
  },
  CHORUS_OF_INSANITY: {
    id: 278661,
    name: 'Chorus of Insanity',
    icon: 'spell_priest_void-flay',
  },
  CHORUS_OF_INSANITY_BUFF: {
    id: 279572,
    name: 'Chorus of Insanity',
    icon: 'spell_priest_void-flay',
  },
};
