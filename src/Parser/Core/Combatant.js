import SPECS from 'common/SPECS';

import Entity from './Entity';

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

class Combatant extends Entity {
  get name() {
    return this._combatantInfo.name;
  }
  get specId() {
    return this._combatantInfo.specID;
  }
  get spec() {
    return SPECS[this.specId];
  }

  // Primaries
  get stamina() {
    return this._combatantInfo.stamina;
  }
  get agility() {
    return this._combatantInfo.agility;
  }
  get strength() {
    return this._combatantInfo.strength;
  }
  get intellect() {
    return this._combatantInfo.intellect;
  }

  // Secondaries
  get critRating() {
    return this._combatantInfo.critSpell;
  }
  get critPercentage() {
    // TODO: Look for a way to include Blood Elf racial
    return 0.08 + this.critRating / 40000;
  }
  get hasteRating() {
    return this._combatantInfo.hasteSpell;
  }
  get hastePercentage() {
    return this.hasteRating / 37500;
  }
  get masteryRating() {
    return this._combatantInfo.mastery;
  }
  get masteryPercentage() {
    switch (this.spec) {
      case SPECS.HOLY_PALADIN:
        return 0.12 + this.masteryRating / 26667;
      case SPECS.HOLY_PRIEST:
        return 0.05 + this.masteryRating / 32000;
      case SPECS.RESTORATION_SHAMAN:
        return 0.24 + this.masteryRating / 13333.3333333;
      case SPECS.ENHANCEMENT_SHAMAN:
        return 0.2 + this.masteryRating / 13333.3333333;
      case SPECS.ELEMENTAL_SHAMAN:
        return 0.15 + this.masteryRating / 23333.3333333;
      case SPECS.GUARDIAN_DRUID:
        return 0.04 + this.masteryRating / 40000;
      case SPECS.RESTORATION_DRUID:
        return 0.048 + this.masteryRating / 66666.6666666;
      case SPECS.FROST_MAGE:
        return 0.18 + this.masteryRating / 17777.7777777;
      case SPECS.FIRE_MAGE:
        return 0.06 + this.masteryRating / 53333.3333333;
      case SPECS.RETRIBUTION_PALADIN:
        return 0.14 + this.masteryRating / 22850;
      case SPECS.PROTECTION_PALADIN:
        return 0.08 + this.masteryRating / 40000;
      case SPECS.MARKSMANSHIP_HUNTER:
        return 0.05 + this.masteryRating / 64000;
      case SPECS.SUBTLETY_ROGUE:
        return 0.2208 + this.masteryRating / 14492.61221;
      case SPECS.BEAST_MASTERY_HUNTER:
        return 0.18 + this.masteryRating / 17777.7777777;
      case SPECS.UNHOLY_DEATH_KNIGHT:
        return 0.18 + this.masteryRating / 17776;
      case SPECS.MISTWEAVER_MONK:
        return 1.04 + this.masteryRating / 3076.96;
      case SPECS.FURY_WARRIOR:
        return 0.11 + this.masteryRating / 28430;
      default:
        throw new Error('Mastery hasn\'t been implemented for this spec yet.');
    }
  }
  get versatilityRating() {
    return this._combatantInfo.versatilityHealingDone;
  }
  get versatilityPercentage() {
    return this.versatilityRating / 47500;
  }

  // Others
  get armorRating() {
    return this._combatantInfo.armor;
  }
  get blockRating() {
    return this._combatantInfo.block;
  }
  get parryRating() {
    return this._combatantInfo.parry;
  }
  get avoidanceRating() {
    return this._combatantInfo.avoidance;
  }
  get leechRating() {
    return this._combatantInfo.leech;
  }
  get speedRating() {
    return this._combatantInfo.speed;
  }

  _combatantInfo = null;
  constructor(parser, combatantInfo) {
    super(parser);

    const playerInfo = parser.playersById[combatantInfo.sourceID];
    this._combatantInfo = {
      // In super rare cases `playerInfo` can be undefined, not taking this into account would cause the log to be unparsable
      name: playerInfo && playerInfo.name,
      ...combatantInfo,
    };

    this._parseTalents(combatantInfo.talents);
    this._parseTraits(combatantInfo.artifact);
    this._parseGear(combatantInfo.gear);
  }

  // region Talents
  _talentsByRow = {};
  _parseTalents(talents) {
    talents.forEach(({ id }, index) => {
      this._talentsByRow[index] = id;
    });
  }
  get talents() {
    return Object.values(this._talentsByRow);
  }
  _getTalent(row) {
    return this._talentsByRow[row];
  }
  get lv15Talent() {
    return this._getTalent(TALENT_ROWS.LV15);
  }
  get lv30Talent() {
    return this._getTalent(TALENT_ROWS.LV30);
  }
  get lv45Talent() {
    return this._getTalent(TALENT_ROWS.LV45);
  }
  get lv60Talent() {
    return this._getTalent(TALENT_ROWS.LV60);
  }
  get lv75Talent() {
    return this._getTalent(TALENT_ROWS.LV75);
  }
  get lv90Talent() {
    return this._getTalent(TALENT_ROWS.LV90);
  }
  get lv100Talent() {
    return this._getTalent(TALENT_ROWS.LV100);
  }
  hasTalent(spellId) {
    return !!Object.keys(this._talentsByRow).find(row => this._talentsByRow[row] === spellId);
  }
  // endregion

  // region Traits
  traitsBySpellId = {};
  _parseTraits(traits) {
    traits.forEach(({ spellID, rank }) => {
      this.traitsBySpellId[spellID] = rank;
    });
  }
  // endregion

  // region Gear
  _gearItemsBySlotId = {};
  _parseGear(gear) {
    gear.forEach((item, index) => {
      this._gearItemsBySlotId[index] = item;
    });
  }
  _getGearItemBySlotId(slotId) {
    return this._gearItemsBySlotId[slotId];
  }
  get gear() {
    return Object.values(this._gearItemsBySlotId);
  }
  get head() {
    return this._getGearItemBySlotId(GEAR_SLOTS.HEAD);
  }
  hasHead(itemId) {
    return this.head && this.head.id === itemId;
  }
  get neck() {
    return this._getGearItemBySlotId(GEAR_SLOTS.NECK);
  }
  hasNeck(itemId) {
    return this.neck && this.neck.id === itemId;
  }
  get shoulder() {
    return this._getGearItemBySlotId(GEAR_SLOTS.SHOULDER);
  }
  hasShoulder(itemId) {
    return this.shoulder && this.shoulder.id === itemId;
  }
  get back() {
    return this._getGearItemBySlotId(GEAR_SLOTS.BACK);
  }
  hasBack(itemId) {
    return this.back && this.back.id === itemId;
  }
  get chest() {
    return this._getGearItemBySlotId(GEAR_SLOTS.CHEST);
  }
  hasChest(itemId) {
    return this.chest && this.chest.id === itemId;
  }
  get wrists() {
    return this._getGearItemBySlotId(GEAR_SLOTS.WRISTS);
  }
  hasWrists(itemId) {
    return this.wrists && this.wrists.id === itemId;
  }
  get hands() {
    return this._getGearItemBySlotId(GEAR_SLOTS.HANDS);
  }
  hasHands(itemId) {
    return this.hands && this.hands.id === itemId;
  }
  get waist() {
    return this._getGearItemBySlotId(GEAR_SLOTS.WAIST);
  }
  hasWaist(itemId) {
    return this.waist && this.waist.id === itemId;
  }
  get legs() {
    return this._getGearItemBySlotId(GEAR_SLOTS.LEGS);
  }
  hasLegs(itemId) {
    return this.legs && this.legs.id === itemId;
  }
  get feet() {
    return this._getGearItemBySlotId(GEAR_SLOTS.FEET);
  }
  hasFeet(itemId) {
    return this.feet && this.feet.id === itemId;
  }
  get finger1() {
    return this._getGearItemBySlotId(GEAR_SLOTS.FINGER1);
  }
  get finger2() {
    return this._getGearItemBySlotId(GEAR_SLOTS.FINGER2);
  }
  getFinger(itemId) {
    if (this.finger1 && this.finger1.id === itemId) {
      return this.finger1;
    }
    if (this.finger2 && this.finger2.id === itemId) {
      return this.finger2;
    }

    return undefined;
  }
  hasFinger(itemId) {
    return this.getFinger(itemId) !== undefined;
  }
  get trinket1() {
    return this._getGearItemBySlotId(GEAR_SLOTS.TRINKET1);
  }
  get trinket2() {
    return this._getGearItemBySlotId(GEAR_SLOTS.TRINKET2);
  }
  getTrinket(itemId) {
    if (this.trinket1 && this.trinket1.id === itemId) {
      return this.trinket1;
    }
    if (this.trinket2 && this.trinket2.id === itemId) {
      return this.trinket2;
    }

    return undefined;
  }
  hasTrinket(itemId) {
    return this.getTrinket(itemId) !== undefined;
  }
  getItem(itemId) {
    return Object.keys(this._gearItemsBySlotId).map(key => this._gearItemsBySlotId[key]).find(item => item.id === itemId);
  }
  // endregion
}

export default Combatant;
