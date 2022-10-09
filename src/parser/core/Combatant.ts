import { Enchant } from 'common/ITEMS/Item';
import { T28_TIER_GEAR_IDS, TIER_BY_CLASSES } from 'common/ITEMS/shadowlands';
import { maybeGetSpell } from 'common/SPELLS';
import { LegendarySpell } from 'common/SPELLS/Spell';
import { getClassBySpecId } from 'game/CLASSES';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import RACES from 'game/RACES';
import { findByBossId } from 'game/raids';
import SOULBINDS from 'game/shadowlands/SOULBINDS';
import SPECS, { Spec } from 'game/SPECS';
import CombatLogParser from 'parser/core/CombatLogParser';
import {
  Buff,
  CombatantInfoEvent,
  Conduit,
  EventType,
  Item,
  SoulbindTrait,
  TalentEntry,
} from 'parser/core/Events';

import Entity from './Entity';
import { PlayerInfo } from './Player';

export interface CombatantInfo extends CombatantInfoEvent {
  name: string;
}

type Spell = {
  id: number;
};

export type Race = {
  id: number;
  mask?: number;
  side: string;
  name: string;
};

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

  get player() {
    return this._combatantInfo.player;
  }

  get spec(): Spec | undefined {
    return SPECS[this.specId];
  }

  get race(): Race | null {
    if (!this.owner.characterProfile || !this.owner.characterProfile.race) {
      return null;
    }
    const raceId = this.owner.characterProfile.race;
    if (raceId === null) {
      // When it is an anonymous report we won't have any race.
      return raceId;
    }

    let race = Object.values(RACES).find((race) => race.id === raceId);
    if (race === undefined) {
      throw new Error(`Unknown race id ${raceId}`);
    }
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

  constructor(parser: CombatLogParser, combatantInfo: CombatantInfoEvent) {
    super(parser);

    const playerInfo = parser.players.find(
      (player: PlayerInfo) => player.id === combatantInfo.sourceID,
    );

    if (combatantInfo.expansion === 'shadowlands') {
      combatantInfo.soulbindTraits = combatantInfo.customPowerSet;
      combatantInfo.conduits = combatantInfo.secondaryCustomPowerSet;
    }

    this._combatantInfo = {
      // In super rare cases `playerInfo` can be undefined, not taking this
      // into account would cause the log to be unparsable
      name: (playerInfo && playerInfo.name) || 'undefined',
      ...combatantInfo,
    };

    this._parseTalents(combatantInfo.talents);
    this._importTalentTree(combatantInfo.talentTree);
    this._parseGear(combatantInfo.gear);
    this._parsePrepullBuffs(combatantInfo.auras);
    this._parseCovenant(combatantInfo.covenantID);
    this._parseSoulbind(combatantInfo.soulbindID);
    this._parseSoulbindTraits(combatantInfo.soulbindTraits);
    this._parseConduits(combatantInfo.conduits);
  }

  // region Talents
  _talentPointsBySpec: Set<number> = new Set<number>();

  _parseTalents(talents: Spell[]) {
    talents?.forEach(({ id }) => {
      this._talentPointsBySpec.add(id);
    });
  }

  private treeTalentsBySpellId: Map<number, TalentEntry> = new Map();
  private _importTalentTree(talents: TalentEntry[]) {
    talents?.forEach((talent) => {
      this.treeTalentsBySpellId.set(talent.spellID, talent);
    });
  }

  /** Returns true iff this combatant has the specified talent. Will be true for any number of
   *  points in the talent, even when not the maximum number of points. */
  hasTalent(spell: number | Spell): boolean {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    return this.treeTalentsBySpellId.has(spellId);
  }

  /** Returns the number of points the combatant has in the specified talent. If the talent
   *  hasn't been picked at all, this will be zero. */
  getTalentRank(spell: number | Spell) {
    const spellId = typeof spell === 'number' ? spell : spell.id;
    return this.treeTalentsBySpellId.get(spellId)?.rank ?? 0;
  }

  /**
   * The number of points spent in each tree.
   *
   * Result is empty for expansions after Wrath.
   */
  get talentPoints(): number[] {
    const expansion = this._combatantInfo.expansion;
    if (expansion === 'tbc' || expansion === 'wotlk') {
      return [...this._talentPointsBySpec];
    } else {
      return [];
    }
  }

  // endregion

  hasWeaponEnchant(enchant: Enchant) {
    if (this.mainHand && this.mainHand.permanentEnchant === enchant.effectId) {
      return true;
    }

    if (this.offHand && this.offHand.permanentEnchant === enchant.effectId) {
      return true;
    }

    return false;
  }

  //region Shadowlands Systems

  //region Covenants
  covenantsByCovenantID: { [key: number]: CombatantInfo['covenantID'] } = {};

  _parseCovenant(covenantID: CombatantInfo['covenantID']) {
    if (!covenantID) {
      return;
    }
    this.covenantsByCovenantID[covenantID] = covenantID;
  }

  hasCovenant(covenantID: CombatantInfo['covenantID']) {
    return Boolean(this.covenantsByCovenantID[covenantID]);
  }

  //endregion

  //region Soulbinds
  soulbindsBySoulbindID: { [key: number]: CombatantInfo['soulbindID'] } = {};

  _parseSoulbind(soulbindID: CombatantInfo['soulbindID']) {
    if (!soulbindID) {
      return;
    }
    this.soulbindsBySoulbindID[soulbindID] = soulbindID;
  }

  hasSoulbind(soulbindID: CombatantInfo['soulbindID']) {
    return Boolean(this.soulbindsBySoulbindID[soulbindID]);
  }

  soulbindTraitsByID: { [key: number]: SoulbindTrait } = {};

  _parseSoulbindTraits(soulbindTraits: SoulbindTrait[] | undefined) {
    if (soulbindTraits === undefined) {
      return;
    }
    soulbindTraits.forEach((soulbindTrait: SoulbindTrait) => {
      if (soulbindTrait.spellID !== 0) {
        this.soulbindTraitsByID[soulbindTrait.spellID] = soulbindTrait;
      }
    });
  }

  hasSoulbindTrait(soulbindTraitID: number) {
    return Boolean(this.soulbindTraitsByID[soulbindTraitID]);
  }

  //endregion

  //region Conduits
  conduitsByConduitID: { [key: number]: Conduit } = {};

  _parseConduits(conduits: Conduit[] | undefined) {
    if (!conduits) {
      return;
    }

    const ilvlToRankMapping: { [key: number]: number } = {
      145: 1,
      158: 2,
      171: 3,
      184: 4,
      200: 5,
      213: 6,
      226: 7,
      239: 8,
      252: 9,
      265: 10,
      278: 11,
      291: 12,
      304: 13,
      317: 14,
      330: 15,
    };

    conduits.forEach((conduit: Conduit) => {
      if (conduit.itemLevel == null) {
        // Conduit has not been parsed to ilvl/rank, do it now
        conduit.itemLevel = conduit.rank;
        conduit.rank = ilvlToRankMapping[conduit.rank];

        if (conduit.rank == null) {
          // If rank is undefined after parsing, something has gone horribly wrong
          console.error('Conduit rank not found', conduit);
        }
      }

      this.conduitsByConduitID[conduit.spellID] = conduit;
    });
  }

  hasConduitBySpellID(spellId: number) {
    return Boolean(this.conduitsByConduitID[spellId]);
  }

  conduitRankBySpellID(spellId: number): number {
    if (!(spellId in this.conduitsByConduitID)) {
      return 0;
    }

    return this.conduitsByConduitID[spellId].rank + (this.likelyHasEmpoweredConduits() ? 2 : 0);
  }

  likelyHasEmpoweredConduits() {
    if (!this._combatantInfo.soulbindID || !(this._combatantInfo.soulbindID in SOULBINDS)) {
      return false;
    }

    return this.hasSoulbindTrait(SOULBINDS[this._combatantInfo.soulbindID].capstoneTraitID);
  }

  //endregion

  //endregion

  // region Gear
  _gearItemsBySlotId: { [key: number]: Item } = {};

  _parseGear(gear: Item[]) {
    const equipedSets: number[][] = [];

    gear
      .filter((item) => item.setID !== undefined)
      .forEach((item) => {
        if (equipedSets[item.setID || 0] === undefined) {
          equipedSets[item.setID || 0] = [];
        }

        equipedSets[item.setID || 0].push(item.id);
      });

    gear.forEach((item, index) => {
      if (item.setID !== undefined && equipedSets[item.setID] !== undefined) {
        item.setItemIDs = equipedSets[item.setID];
      }

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

  private legendaries: Set<number> = new Set();
  private scannedForLegendaries = false;

  /**
   * Each legendary is given a specific `effectID` that is the same regardless which slot it appears on.
   * This id is the same as the spell ID on Wowhead.
   */
  hasLegendary(legendary: LegendarySpell) {
    if (!this.scannedForLegendaries && this.legendaries.size === 0) {
      Object.values(this._gearItemsBySlotId).forEach((item) => {
        if (item.effectID) {
          this.legendaries.add(item.effectID);
        }
      });
      this.scannedForLegendaries = true;
    }

    return this.legendaries.has(legendary.id);
  }

  private itemMap: Map<number, Item> = new Map();
  private scannedForItems = false;

  getItem(itemId: number) {
    if (!this.scannedForItems && this.itemMap.size === 0) {
      Object.values(this._gearItemsBySlotId).forEach((item) => {
        this.itemMap.set(item.id, item);
      });
      this.scannedForItems = true;
    }

    return this.itemMap.get(itemId);
  }

  // endregion

  // region Tier
  get tierPieces(): Item[] {
    return [this.head, this.shoulder, this.chest, this.legs, this.hands];
  }

  setIdBySpec(): T28_TIER_GEAR_IDS {
    return TIER_BY_CLASSES[getClassBySpecId(this._combatantInfo.specID)];
  }

  has2Piece(setId?: T28_TIER_GEAR_IDS) {
    if (!setId) {
      setId = this.setIdBySpec();
    }
    if (!setId) {
      console.error("no setId passed and couldn't match spec to a setId");
      return false;
    }
    return this.tierPieces.filter((gear) => gear?.setID === setId).length >= 2;
  }

  has4Piece(setId?: T28_TIER_GEAR_IDS) {
    if (!setId) {
      setId = this.setIdBySpec();
    }
    if (!setId) {
      console.error("no setId passed and couldn't match spec to a setId");
      return false;
    }
    return this.tierPieces.filter((gear) => gear?.setID === setId).length >= 4;
  }

  // endregion

  _parsePrepullBuffs(buffs: Buff[]) {
    // TODO: We only apply prepull buffs in the `auras` prop of combatantinfo,
    // but not all prepull buffs are in there and ApplyBuff finds more. We
    // should update ApplyBuff to add the other buffs to the auras prop of the
    // combatantinfo too (or better yet, make a new normalizer for that).
    const timestamp = this.owner.fight.start_time;
    buffs.forEach((buff) => {
      const spell = maybeGetSpell(buff.ability);

      this.applyBuff({
        type: EventType.ApplyBuff,
        timestamp: timestamp,
        ability: {
          abilityIcon: buff.icon.replace('.jpg', ''),
          guid: buff.ability,
          name: spell?.name || '',
          type: 0,
        },
        sourceID: buff.source,
        sourceIsFriendly: true,
        targetID: this.id,
        targetIsFriendly: true,
        start: timestamp,
      });
    });
  }
}

export default Combatant;
