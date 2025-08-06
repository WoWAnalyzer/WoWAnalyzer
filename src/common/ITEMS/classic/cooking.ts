import Item, { Food } from 'common/ITEMS/Item';

const items = {
  MOGU_FISH_STEW: {
    id: 74650,
    name: 'Mogu Fish Stew',
    icon: 'inv_misc_food_cooked_mogufishstew.jpg',
    buffId: 104277,
  },
  SEA_MIST_RICE_NOODLES: {
    id: 74648,
    name: 'Sea Mist Rice Noodles',
    icon: 'inv_misc_food_cooked_seamistricenoodles.jpg',
    buffId: 104275,
  },
  BLACK_PEPPER_RIBS_AND_SHRIMP: {
    id: 74646,
    name: 'Black Pepper Ribs and Shrimp',
    icon: 'inv_misc_food_cooked_golden_black_pepper_ribs_and_shrimp.jpg',
    buffId: 104272,
  },
  SPICED_BLOSSOM_SOUP: {
    id: 101748,
    name: 'Spiced Blossom Soup',
    icon: 'inv_misc_herb_frostlotus.jpg',
    buffId: 146806,
  },
  PANDAREN_BANQUET: {
    id: 74919,
    name: 'Pandaren Banquet',
    icon: 'inv_misc_food_cooked_pabanquet_general.jpg',
  },
  PANDAREN_TREASURE_NOODLE_CART: {
    id: 145196,
    name: 'Pandaren Treasure Noodle Cart',
    icon: 'inv_misc_noodle_cart_epic_level.jpg',
  },
  GREAT_PANDAREN_BANQUET: {
    id: 75016,
    name: 'Great Pandaren Banquet',
    icon: 'inv_misc_food_cooked_greatpabanquet_general.jpg',
  },
  SEASONED_POMFRUIT_SLICES: {
    id: 101746,
    name: 'Seasoned Pomfruit Slices',
    icon: 'inv_misc_food_vendor_slicedpeaches.jpg',
    buffId: 146805,
  },
  BRAISED_TURTLE: {
    id: 74649,
    name: 'Braised Turtle',
    icon: 'inv_misc_food_cooked_braisedturtle.jpg',
    buffId: 104276,
  },
  CHUN_TIAN_SPRING_ROLLS: {
    id: 74656,
    name: 'Chun Tian Spring Rolls',
    icon: 'inv_misc_food_cooked_springrolls.jpg',
    buffId: 104283,
  },
  FLUFFY_SILKFEATHER_OMELET: {
    id: 101750,
    name: 'Fluffy Silkfeather Omelet',
    icon: 'inv_misc_food_06.jpg',
    buffId: 146804,
  },
  ETERNAL_BLOSSOM_FISH: {
    id: 74645,
    name: 'Eternal Blossom Fish',
    icon: 'inv_misc_food_cooked_eternalblossomfish.jpg',
    buffId: 104271,
  },
  RICE_PUDDING: {
    id: 86069,
    name: 'Rice Pudding',
    icon: 'inv_misc_food_vendor_poundedricecake_1.jpg',
    buffId: 125108,
  },
  SPICY_VEGETABLE_CHIPS: {
    id: 86074,
    name: 'Spicy Vegetable Chips',
    icon: 'inv_misc_food_vendor_poundedricecakes.jpg',
    buffId: 125115,
  },
  SPICY_SALMON: {
    id: 86073,
    name: 'Spicy Salmon',
    icon: 'inv_misc_food_meat_cooked_06.jpg',
    buffId: 125113,
  },
  TWIN_FISH_PLATTER: {
    id: 74655,
    name: 'Twin Fish Platter',
    icon: 'inv_misc_food_cooked_twinfishplatter.jpg',
    buffId: 104282,
  },
  FIRE_SPIRIT_SALMON: {
    id: 74652,
    name: 'Fire Spirit Salmon',
    icon: 'inv_misc_food_cooked_firespiritsalmon.jpg',
    buffId: 104279,
  },
  // it was at this point that i said "fuck the 20 different banquets"
  MANGO_ICE: {
    id: 101745,
    name: 'Mango Ice',
    icon: 'inv_misc_food_mango_ice.jpg',
    buffId: 146809,
  },
  STUFFED_LUSHROOMS: {
    id: 101749,
    name: 'Stuffed Lushrooms',
    icon: 'spell_druid_wildmushroom.jpg',
    buffId: 146808,
  },
  STEAMED_CRAB_SURPRISE: {
    id: 74653,
    name: 'Steamed Crab Surprise',
    icon: 'inv_misc_food_cooked_steamcrabsurprise.jpg',
    buffId: 104280,
  },
  PEARL_MILK_TEA: {
    id: 81414,
    name: 'Pearl Milk Tea',
    icon: 'inv_drink_milk_01.jpg',
    buffId: 124219,
  },
  TANGY_YOGURT: {
    id: 81409,
    name: 'Tangy Yogurt',
    icon: 'inv_misc_food_vendor_tangypeachyogurt.jpg',
    buffId: 124217,
  },
  GREEN_CURRY_FISH: {
    id: 81410,
    name: 'Green Curry Fish',
    icon: 'inv_misc_food_vendor_greenfishbonescurry.jpg',
    buffId: 124218,
  },
  SKEWERED_PEANUT_CHICKEN: {
    id: 81413,
    name: 'Skewered Peanut Chicken',
    icon: 'inv_misc_skeweredpeanutchicken.jpg',
    buffId: 124221,
  },
  PEACH_PIE: {
    id: 81411,
    name: 'Peach Pie',
    icon: 'inv_misc_food_vendor_peachpie.jpg',
    buffId: 125071,
  },
  WILDFOWL_GINSENG_SOUP: {
    id: 86070,
    name: 'Wildfowl Ginseng Soup',
    icon: 'inv_misc_food_vendor_needlemushroomsoup.jpg',
    buffId: 125106,
  },
  RED_BEAN_BUN: {
    id: 81408,
    name: 'Red Bean Bun',
    icon: 'inv_misc_food_vendor_redbeanbun.jpg',
    buffId: 124216,
  },
  BLANCHEND_NEEDLE_MUSHROOMS: {
    id: 81412,
    name: 'Blanched Needle Mushrooms',
    icon: 'inv_misc_food_vendor_blanchedneedlemushroom.jpg',
    buffId: 124220,
  },
  FARMERS_DELIGHT: {
    id: 101747,
    name: "Farmer's Delight",
    icon: 'inv_misc_food_117_heartysoup.jpg',
    buffId: 146807,
  },
} satisfies Record<string, Item | Food>;
export default items;
