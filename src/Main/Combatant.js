export const TALENT_ROWS = {
  LV15: 0,
  LV30: 1,
  LV45: 2,
  LV60: 3,
  LV75: 4,
  LV90: 5,
  LV100: 6,
};
export const GEAR_SLOTS = {
  HEAD: 0,
  NECK: 1,
  SHOULDER: 2,
  SHIRT: 3,
  CHEST: 4,
  WAIST: 5,
  LEGS: 6,
  FEET: 7,
  WRISTS: 8,
  HANDS: 9,
  FINGER1: 10,
  FINGER2: 11,
  TRINKET1: 12,
  TRINKET2: 13,
  BACK: 14,
  MAINHAND: 15,
  OFFHAND: 16,
  TABARD: 17,
};

class Combatant {
  masteryRating = null;
  get masteryPercentage() {
    return Combatant.calculateMasteryPercentage(this.masteryRating);
  }

  talentsByRow = {};
  traitsBySpellId = {};
  gearBySlotId = {};

  constructor(event) {
    this.masteryRating = event.mastery;

    this.parseTalents(event.talents);
    this.parseTraits(event.artifact);
    this.parseGear(event.gear);
  }

  //region Talents
  parseTalents(talents) {
    talents.forEach(({ id }, index) => {
      this.talentsByRow[index] = id;
    });
  }
  getTalent(row) {
    return this.talentsByRow[row];
  }
  get lv15Talent() {
    return this.getTalent(TALENT_ROWS.LV15);
  }
  get lv30Talent() {
    return this.getTalent(TALENT_ROWS.LV30);
  }
  get lv45Talent() {
    return this.getTalent(TALENT_ROWS.LV45);
  }
  get lv60Talent() {
    return this.getTalent(TALENT_ROWS.LV60);
  }
  get lv75Talent() {
    return this.getTalent(TALENT_ROWS.LV75);
  }
  get lv90Talent() {
    return this.getTalent(TALENT_ROWS.LV90);
  }
  get lv100Talent() {
    return this.getTalent(TALENT_ROWS.LV100);
  }
  hasTalent(row, talentSpellId) {
    return this.getTalent(row) === talentSpellId;
  }
  //endregion

  //region Traits
  parseTraits(traits) {
    traits.forEach(({ spellID, rank }) => {
      this.traitsBySpellId[spellID] = rank;
    });
  }
  //endregion

  //region Gear
  parseGear(gear) {
    gear.forEach(({ id }, index) => {
      this.gearBySlotId[index] = id;
    });
  }
  getGearBySlotId(slotId) {
    return this.gearBySlotId[slotId];
  }
  get head() {
    return this.getGearBySlotId(GEAR_SLOTS.HEAD);
  }
  hasHead(itemId) {
    return this.head === itemId;
  }
  get neck() {
    return this.getGearBySlotId(GEAR_SLOTS.NECK);
  }
  hasNeck(itemId) {
    return this.neck === itemId;
  }
  get shoulder() {
    return this.getGearBySlotId(GEAR_SLOTS.SHOULDER);
  }
  hasShoulder(itemId) {
    return this.shoulder === itemId;
  }
  get back() {
    return this.getGearBySlotId(GEAR_SLOTS.BACK);
  }
  hasBack(itemId) {
    return this.back === itemId;
  }
  get wrists() {
    return this.getGearBySlotId(GEAR_SLOTS.WRISTS);
  }
  hasWrists(itemId) {
    return this.wrists === itemId;
  }
  get hands() {
    return this.getGearBySlotId(GEAR_SLOTS.HANDS);
  }
  hasHands(itemId) {
    return this.hands === itemId;
  }
  get waist() {
    return this.getGearBySlotId(GEAR_SLOTS.WAIST);
  }
  hasWaist(itemId) {
    return this.waist === itemId;
  }
  get legs() {
    return this.getGearBySlotId(GEAR_SLOTS.LEGS);
  }
  hasLegs(itemId) {
    return this.legs === itemId;
  }
  get feet() {
    return this.getGearBySlotId(GEAR_SLOTS.FEET);
  }
  hasFeet(itemId) {
    return this.feet === itemId;
  }
  get finger1() {
    return this.getGearBySlotId(GEAR_SLOTS.FINGER1);
  }
  get finger2() {
    return this.getGearBySlotId(GEAR_SLOTS.FINGER2);
  }
  hasRing(itemId) {
    return this.finger1 === itemId || this.finger2 === itemId;
  }
  get trinket1() {
    return this.getGearBySlotId(GEAR_SLOTS.TRINKET1);
  }
  get trinket2() {
    return this.getGearBySlotId(GEAR_SLOTS.TRINKET2);
  }
  hasTrinket(itemId) {
    return this.trinket1 === itemId || this.trinket2 === itemId;
  }
  //endregion

  static calculateMasteryPercentage(masteryRating) {
    // For paladins:
    return 0.12 + masteryRating / 26667;
  }
}

export default Combatant;
