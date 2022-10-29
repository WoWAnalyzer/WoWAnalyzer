import * as SPELLS from './SPELLS';

export default {
  [SPELLS.FLASH_HEAL]: [
    48070,
    25235,
    25233,
    10917,
    10916,
    10915,
    9474,
    9473,
    9472,
    2061,
    2050, // Lesser Heal
    2052, // Lesser Heal
    2053, // Lesser Heal
  ],
  [SPELLS.GREATER_HEAL]: [
    48062,
    25213,
    25210,
    25314,
    10965,
    10964,
    10963,
    2060,
    6064, // Heal
    6063, // Heal
    2054, // Heal
    2055, // Heal
  ],
  [SPELLS.RENEW]: [
    48067,
    25222,
    25221,
    25315,
    10929,
    10928,
    10927,
    6078,
    6077,
    6076,
    6075,
    6074,
    139,
  ],
  [SPELLS.POWER_WORD_SHIELD]: [
    48065,
    25218,
    25217,
    10901,
    10900,
    10899,
    10898,
    6066,
    6065,
    3747,
    600,
    592,
    17,
  ],
  [SPELLS.PRAYER_OF_HEALING]: [25308, 25316, 10961, 10960, 996, 596],
  [SPELLS.SHADOW_WORD_PAIN]: [48124, 25368, 25367, 10894, 10893, 10892, 2767, 992, 970, 594, 589],
  [SPELLS.MIND_BLAST]: [
    48126,
    25375,
    25372,
    10947,
    10946,
    10945,
    8106,
    8105,
    8104,
    8103,
    8102,
    8092,
  ],
  [SPELLS.SHADOW_WORD_DEATH]: [48157, 32996, 32379],
  [SPELLS.SMITE]: [48122, 25364, 25363, 10934, 10933, 6060, 1004, 984, 598, 591, 585],
  [SPELLS.HOLY_FIRE]: [48134, 25384, 15261, 15267, 15266, 15265, 15264, 15263, 15262, 14914],
  [SPELLS.PSYCHIC_SCREAM]: [10888, 8124, 8122],
  [SPELLS.DISPEL_MAGIC]: [988, 527],
  [SPELLS.SHACKLE_UNDEAD]: [9485, 9484],
  [SPELLS.MIND_SOOTHE]: [10953, 8192, 453],
  [SPELLS.MIND_VISION]: [2096],
  [SPELLS.RESURRECTION]: [25435, 20770, 10881, 10880, 2010, 2006],
  [SPELLS.POWER_WORD_FORTITUDE]: [25389, 10938, 10937, 2791, 1245, 1244, 1243],
  [SPELLS.SHADOW_PROTECTION]: [10958, 10957, 976],
  [SPELLS.DIVINE_SPIRIT]: [25312, 27841, 14819, 14818, 14752],
  [SPELLS.PRAYER_OF_FORTITUDE]: [25392, 21564, 21562],
  [SPELLS.PRAYER_OF_SPIRIT]: [32999, 27681],
  [SPELLS.PRAYER_OF_SHADOW_PROTECTION]: [25433, 39374, 27683],
  [SPELLS.INNER_FIRE]: [48040, 25431, 10952, 10951, 1006, 602, 7128, 588],
  [SPELLS.HOLY_NOVA]: [48077, 25331, 27801, 27800, 27799, 15431, 15430, 15237],
  [SPELLS.LIGHTWELL]: [48086, 28275, 27871, 27870, 724],
  [SPELLS.CIRCLE_OF_HEALING]: [48088, 34866, 34865, 34864, 34863, 34861],
  [SPELLS.MIND_FLAY]: [48155, 25387, 18807, 17314, 17313, 17312, 17311, 15407],
  [SPELLS.VAMPIRIC_TOUCH]: [48159, 34917, 34916, 34914],
  [SPELLS.CHASTISE]: [44046, 44045, 44044, 44043, 44041],
  [SPELLS.DESPERATE_PRAYER]: [48172, 25437, 19243, 19242, 19241, 19240, 19238, 19236, 13908],
  [SPELLS.FEEDBACK]: [19275, 19274, 19273, 19271, 13896],
  [SPELLS.STAR_SHARDS]: [19305, 19304, 19303, 19302, 19299, 19296, 10797],
  [SPELLS.TOUCH_OF_WEAKNESS]: [19266, 19265, 19264, 19262, 19261, 2652],
  [SPELLS.DEVOURING_PLAGUE]: [48299, 25467, 19280, 19279, 19278, 19277, 19276, 2944],
  [SPELLS.SHADOW_GUARD]: [19312, 19311, 19310, 19309, 19308, 18137],
  [SPELLS.HEX_OF_WEAKNESS]: [19285, 19284, 19283, 19282, 19281, 9035],
  [SPELLS.MIND_SEAR]: [48045],
  [SPELLS.PENANCE]: [53007],
  [SPELLS.PENANCE_HEALING]: [47750, 53006, 53005, 47540],
  [SPELLS.PENANCE_DAMAGE]: [52998, 53006, 53005, 47540],
  [SPELLS.PRAYER_OF_MENDING]: [48112, 33076],
  [SPELLS.FADE]: [25429],
  [SPELLS.BINDING_HEAL]: [48119, 32546],
};

export const whitelist = {};

export interface LowRankSpells {
  [primarySpellId: number]: number[];
}
