import SPECS from 'game/SPECS';
import RACES from 'game/RACES';
import TALENT_ROWS from 'game/TALENT_ROWS';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import traitIdMap from 'common/TraitIdMap';
import corruptionIdMap from 'common/corruptionIdMap';
import SPELLS from 'common/SPELLS';
import { findByBossId } from 'raids/index';
import { CombatantInfoEvent, Item, Trait } from 'parser/core/Events';
import Entity from './Entity';

export interface CombatantInfo extends CombatantInfoEvent {
  name: string;
}

type Essence = {
  icon: string;
  isMajor: boolean;
  rank: number;
  spellID: number;
  traitID: number;
};

type Spell = {
  id: number;
};

type Parser = {
  players: Array<Player>;
};

type Player = {
  id: number;
  name: string;
  talents: Array<Talent>;
  artifact: any;
  heartOfAzeroth: any;
  gear: any;
  auras: any;
};

type Talent = {
  id: number;
};

type Corruption = {
  name: string;
  /** The amount of Corruption gained by using this effect */
  corruption?: number;
  /** The rank of the effect */
  rank: string;
  /** How often someone has this corruption effect of that exact rank */
  count: number;
}

class Combatant extends Entity {
  get id() {
    return this._combatantInfo.sourceID;
  }
  get name() {
    return this._combatantInfo.name;
  }
  get specId() {
    return this._combatantInfo.specID;
  }
  get spec() {
    return SPECS[this.specId];
  }
  get race() {
    if (!this.owner.characterProfile) {
      return null;
    }
    const raceId = this.owner.characterProfile.race;
    let race = Object.values(RACES).find(race => race.id === raceId);
    if (!this.owner.boss) {
      return race;
    }
    const boss = findByBossId(this.owner.boss.id);
    if (boss && boss.fight.raceTranslation) {
      race = boss.fight.raceTranslation(race, this.spec);
    }
    return race;
  }
  get characterProfile() {
    return this.owner.characterProfile;
  }

  _combatantInfo: CombatantInfo;
  constructor(parser: Parser, combatantInfo: CombatantInfoEvent) {
    super(parser);

    const playerInfo = parser.players.find(
      (player: Player) => player.id === combatantInfo.sourceID,
    );
    this._combatantInfo = {
      // In super rare cases `playerInfo` can be undefined, not taking this
      // into account would cause the log to be unparsable
      name: (
        playerInfo && playerInfo.name
      ) || 'undefined',
      ...combatantInfo,
    };

    this._parseTalents(combatantInfo.talents);
    this._parseTraits(combatantInfo.artifact);
    this._parseEssences(combatantInfo.heartOfAzeroth);
    this._parseGear(combatantInfo.gear);
    this._parsePrepullBuffs(combatantInfo.auras);
    this._parseCorruption(combatantInfo.gear);
  }

  // region Talents
  _talentsByRow: { [key: number]: number } = {};
  _parseTalents(talents: Array<Talent>) {
    talents.forEach(({ id }, index: number) => {
      this._talentsByRow[index] = id;
    });
  }
  get talents() {
    return Object.values(this._talentsByRow);
  }
  _getTalent(row: number) {
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

  hasTalent(spell: Spell) {
    const spellId = spell instanceof Object ? spell.id : spell;
    return Boolean(
      Object.keys(this._talentsByRow).find(
        (row: string) => this._talentsByRow[Number(row)] === spellId,
      ),
    );
  }

  // endregion

  // region Traits
  traitsBySpellId: { [key: number]: Array<number> } = {};
  _parseTraits(traits: Array<Trait>) {
    traits.forEach(({ traitID, rank }) => {
      const spellId = traitIdMap[traitID];
      if (spellId === undefined) {
        return;
      }
      if (!this.traitsBySpellId[spellId]) {
        this.traitsBySpellId[spellId] = [];
      }
      this.traitsBySpellId[spellId].push(rank);
    });
  }
  hasTrait(spellId: number) {
    return Boolean(this.traitsBySpellId[spellId]);
  }
  traitRanks(spellId: number) {
    return this.traitsBySpellId[spellId];
  }
  // endregion

  // region Essences
  essencesByTraitID: { [key: number]: Essence } = {};
  _parseEssences(essences: Array<Essence>) {
    if (essences === undefined) {
      return;
    }
    essences.forEach((essence: Essence) => {
      if (Boolean(this.essencesByTraitID[essence.traitID])) {
        essence.isMajor = true;
      }
      this.essencesByTraitID[essence.traitID] = essence;
      //essence = {icon:string, isMajor:bool, rank:int, slot:int, spellID:int,
      // traitID:int}
    });
  }
  hasEssence(traitId: number) {
    return Boolean(this.essencesByTraitID[traitId]);
  }
  hasMajor(traitId: number) {
    return this.essencesByTraitID[traitId] &&
      this.essencesByTraitID[traitId].isMajor;
  }
  essenceRank(traitId: number) {
    return (
      this.essencesByTraitID[traitId] && this.essencesByTraitID[traitId].rank
    );
  }
  // endregion

  // region Corruption effects
  corruptionBySpellId: { [key: number]: Corruption } = {};
  _parseCorruption(gear: Array<Item>) {
    gear.forEach((item) => {
      const bonusId = item.bonusIDs?.find(x => Object.keys(corruptionIdMap)
        .includes(x.toString()));
      if (bonusId === undefined) {
        return;
      }
      const corr = corruptionIdMap[bonusId];

      if (!this.corruptionBySpellId[corr.spellId]) {
        this.corruptionBySpellId[corr.spellId] = {
          name: corr.name,
          corruption: corr.corruption,
          rank: corr.rank,
          count: 1,
        };
      } else {
        this.corruptionBySpellId[corr.spellId].count += 1;
      }
    });
  }
  hasCorruption(spellId: number) {
    return Boolean(this.corruptionBySpellId[spellId]);
  }
  hasCorruptionByName(spell: string) {
    return Boolean(Object.values(this.corruptionBySpellId).find(p => p.name ===
      spell));
  }
  getCorruptionCount(spellId: number) {
    return Number(this.corruptionBySpellId[spellId]?.count || 0);
  }
  // endregion

  // region Gear
  _gearItemsBySlotId: { [key: number]: Item } = {};
  _parseGear(gear: Array<Item>) {
    gear.forEach((item, index) => {
      this._gearItemsBySlotId[index] = item;
    });
  }
  _getGearItemBySlotId(slotId: number) {
    return this._gearItemsBySlotId[slotId];
  }
  _getGearItemGemsBySlotId(slotId: number) {
    if (this._gearItemsBySlotId[slotId]) {
      return this._gearItemsBySlotId[slotId].gems;
    }
    return undefined;
  }
  get gear() {
    return Object.values(this._gearItemsBySlotId);
  }
  get head() {
    return this._getGearItemBySlotId(GEAR_SLOTS.HEAD);
  }
  hasHead(itemId: number) {
    return this.head && this.head.id === itemId;
  }
  get neck() {
    return this._getGearItemBySlotId(GEAR_SLOTS.NECK);
  }
  hasNeck(itemId: number) {
    return this.neck && this.neck.id === itemId;
  }
  get shoulder() {
    return this._getGearItemBySlotId(GEAR_SLOTS.SHOULDER);
  }
  hasShoulder(itemId: number) {
    return this.shoulder && this.shoulder.id === itemId;
  }
  get back() {
    return this._getGearItemBySlotId(GEAR_SLOTS.BACK);
  }
  hasBack(itemId: number) {
    return this.back && this.back.id === itemId;
  }
  get chest() {
    return this._getGearItemBySlotId(GEAR_SLOTS.CHEST);
  }
  hasChest(itemId: number) {
    return this.chest && this.chest.id === itemId;
  }
  get wrists() {
    return this._getGearItemBySlotId(GEAR_SLOTS.WRISTS);
  }
  hasWrists(itemId: number) {
    return this.wrists && this.wrists.id === itemId;
  }
  get hands() {
    return this._getGearItemBySlotId(GEAR_SLOTS.HANDS);
  }
  hasHands(itemId: number) {
    return this.hands && this.hands.id === itemId;
  }
  get waist() {
    return this._getGearItemBySlotId(GEAR_SLOTS.WAIST);
  }
  hasWaist(itemId: number) {
    return this.waist && this.waist.id === itemId;
  }
  get legs() {
    return this._getGearItemBySlotId(GEAR_SLOTS.LEGS);
  }
  hasLegs(itemId: number) {
    return this.legs && this.legs.id === itemId;
  }
  get feet() {
    return this._getGearItemBySlotId(GEAR_SLOTS.FEET);
  }
  hasFeet(itemId: number) {
    return this.feet && this.feet.id === itemId;
  }
  get finger1() {
    return this._getGearItemBySlotId(GEAR_SLOTS.FINGER1);
  }
  get finger2() {
    return this._getGearItemBySlotId(GEAR_SLOTS.FINGER2);
  }
  getFinger(itemId: number) {
    if (this.finger1 && this.finger1.id === itemId) {
      return this.finger1;
    }
    if (this.finger2 && this.finger2.id === itemId) {
      return this.finger2;
    }

    return undefined;
  }
  hasFinger(itemId: number) {
    return this.getFinger(itemId) !== undefined;
  }
  get trinket1() {
    return this._getGearItemBySlotId(GEAR_SLOTS.TRINKET1);
  }
  get trinket2() {
    return this._getGearItemBySlotId(GEAR_SLOTS.TRINKET2);
  }
  getTrinket(itemId: number) {
    if (this.trinket1 && this.trinket1.id === itemId) {
      return this.trinket1;
    }
    if (this.trinket2 && this.trinket2.id === itemId) {
      return this.trinket2;
    }

    return undefined;
  }
  hasTrinket(itemId: number) {
    return this.getTrinket(itemId) !== undefined;
  }
  hasMainHand(itemId: number) {
    return this.mainHand && this.mainHand.id === itemId;
  }
  get mainHand() {
    return this._getGearItemBySlotId(GEAR_SLOTS.MAINHAND);
  }
  hasOffHand(itemId: number) {
    return this.offHand && this.offHand.id === itemId;
  }
  get offHand() {
    return this._getGearItemBySlotId(GEAR_SLOTS.OFFHAND);
  }
  // Punchcards are insertable items for the Pocket Sized Computation Device
  // trinket The PSCD never has actual gems in it, since it is a one-time quest
  // reward
  get trinket1Punchcard() {
    const punchcard =
      this._getGearItemGemsBySlotId(GEAR_SLOTS.TRINKET1) || undefined;
    return punchcard;
  }
  get trinket2Punchcard() {
    const punchcard =
      this._getGearItemGemsBySlotId(GEAR_SLOTS.TRINKET2) || undefined;
    return punchcard;
  }
  // Red punchcard is always the first in the array
  getRedPunchcard(id: number) {
    if (this.trinket1Punchcard && this.trinket1Punchcard[0].id === id) {
      return this.trinket1Punchcard[0];
    }
    if (this.trinket2Punchcard && this.trinket2Punchcard[0].id === id) {
      return this.trinket2Punchcard[0];
    }

    return undefined;
  }
  hasRedPunchcard(id: number) {
    return this.getRedPunchcard(id) !== undefined;
  }
  // Yellow punchcard is always second
  getYellowPunchcard(id: number) {
    if (this.trinket1Punchcard && this.trinket1Punchcard[1].id === id) {
      return this.trinket1Punchcard[1];
    }
    if (this.trinket2Punchcard && this.trinket2Punchcard[1].id === id) {
      return this.trinket2Punchcard[1];
    }

    return undefined;
  }
  hasYellowPunchcard(id: number) {
    return this.getYellowPunchcard(id) !== undefined;
  }
  getItem(itemId: number) {
    return Object.keys(this._gearItemsBySlotId)
      .map((key: any) => this._gearItemsBySlotId[key])
      .find((item: Item) => item.id === itemId);
  }
  // endregion

  _parsePrepullBuffs(buffs: any) {
    // TODO: We only apply prepull buffs in the `auras` prop of combatantinfo,
    // but not all prepull buffs are in there and ApplyBuff finds more. We
    // should update ApplyBuff to add the other buffs to the auras prop of the
    // combatantinfo too (or better yet, make a new normalizer for that).
    const timestamp = this.owner.fight.start_time;
    buffs.forEach((buff: any) => {
      const spell = SPELLS[buff.ability];
      this.applyBuff({
        ability: {
          abilityIcon: buff.icon.replace('.jpg', ''),
          guid: buff.ability,
          name: spell ? spell.name : undefined,
        },
        sourceID: buff.source,
        targetID: this.id,
        start: timestamp,
      });
    });
  }
}

export default Combatant;
