import { Enchant } from 'common/ITEMS/Item';
import { TIER_BY_CLASSES } from 'common/ITEMS/dragonflight';
import { getClassBySpecId } from 'game/CLASSES';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import RACES, { Race } from 'game/RACES';
import { findByBossId } from 'game/raids';
import SPECS, { Spec } from 'game/SPECS';
import CombatLogParser from 'parser/core/CombatLogParser';
import { Buff, CombatantInfoEvent, EventType, Item, TalentEntry } from 'parser/core/Events';
import { PRIMARY_STAT } from 'parser/shared/modules/features/STAT';
import { TIERS } from 'game/TIERS';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

import Entity from './Entity';
import { PlayerInfo } from './Player';
import { Talent } from 'common/TALENTS/types';

export interface CombatantInfo extends CombatantInfoEvent {
  name: string;
}

type Spell = {
  id: number;
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

  get primaryStat(): PRIMARY_STAT {
    const spec = this.spec;

    if (spec == null) {
      throw new Error(`Tried to access primaryStat but combatant ${this.name} has no spec`);
    }

    return spec.primaryStat;
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
    if (!race) {
      throw new Error(`Unknown race id ${raceId}`);
    }
    if (!this.owner.boss) {
      return race;
    }
    const boss = findByBossId(this.owner.boss.id);
    if (boss && boss.fight.raceTranslation) {
      race = boss.fight.raceTranslation(race, this.spec);
    }
    return race ?? null;
  }

  get characterProfile() {
    return this.owner.characterProfile;
  }

  _combatantInfo: CombatantInfo;

  public readonly ilvl: number | undefined;

  constructor(parser: CombatLogParser, combatantInfo: CombatantInfoEvent) {
    super(parser);

    const playerInfo = parser.players.find(
      (player: PlayerInfo) => player.id === combatantInfo.sourceID,
    );

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

    this.ilvl =
      this.gear.length > 0
        ? this.gear.map((item) => item.itemLevel).reduce((sum, val) => sum + val, 0) /
          this.gear.length
        : undefined;
  }

  // region Talents
  _talentPointsBySpec: Set<number> = new Set<number>();

  _parseTalents(talents: Spell[]) {
    talents?.forEach(({ id }) => {
      this._talentPointsBySpec.add(id);
    });
  }

  private treeTalentsByEntryId: Map<number, TalentEntry> = new Map();
  private _importTalentTree(talents: TalentEntry[]) {
    talents?.forEach((talent) => {
      this.treeTalentsByEntryId.set(talent.id, talent);
    });
  }

  /** Returns true if this combatant has the specified talent. Will be true for any number of
   *  points in the talent, even when not the maximum number of points. */
  hasTalent(talent: Talent): boolean {
    return talent.entryIds.filter((entryId) => this.treeTalentsByEntryId.has(entryId)).length > 0;
  }

  /**
   * Return the number of ranks that the provided talents have in total.
   * Useful for repeated talents (like Empower Rune Weapon or Stormkeeper).
   */
  getMultipleTalentRanks(...talents: Talent[]): number {
    return talents.reduce((count, talent) => count + this.getTalentRank(talent), 0);
  }

  /** Returns the number of points the combatant has in the specified talent. If the talent
   *  hasn't been picked at all, this will be zero. */
  getTalentRank(talent: Talent) {
    const foundEntryId = talent.entryIds.find((entryId) => this.treeTalentsByEntryId.has(entryId));
    if (!foundEntryId) {
      return 0;
    }
    return this.treeTalentsByEntryId.get(foundEntryId)?.rank ?? 0;
  }

  getTalentDefinitionId(talent: Talent) {
    const foundDefinitionId = talent.definitionIds.find(
      (definitionId) => definitionId.specId === this.specId,
    );
    if (!foundDefinitionId) {
      return 0;
    }
    return foundDefinitionId.id;
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
      const equippedItem = { ...item };
      if (equippedItem.setID !== undefined && equipedSets[equippedItem.setID] !== undefined) {
        equippedItem.setItemIDs = equipedSets[equippedItem.setID];
      }

      this._gearItemsBySlotId[index] = equippedItem;
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

  setIdBySpecByTier(tier: TIERS) {
    return TIER_BY_CLASSES[tier]?.[getClassBySpecId(this._combatantInfo.specID)];
  }

  has2PieceByTier(tier: TIERS) {
    const setID = this.setIdBySpecByTier(tier);
    if (!setID) {
      console.error('Unable to find set ID for spec and tier');
      return false;
    }
    return this.tierPieces.filter((gear) => gear?.setID === setID).length >= 2;
  }

  has4PieceByTier(tier: TIERS) {
    const setID = this.setIdBySpecByTier(tier);
    if (!setID) {
      console.error('Unable to find set ID for spec and tier');
      return false;
    }
    return this.tierPieces.filter((gear) => gear?.setID === setID).length >= 4;
  }

  // endregion

  _parsePrepullBuffs(buffs: Buff[]) {
    // TODO: We only apply prepull buffs in the `auras` prop of combatantinfo,
    // but not all prepull buffs are in there and ApplyBuff finds more. We
    // should update ApplyBuff to add the other buffs to the auras prop of the
    // combatantinfo too (or better yet, make a new normalizer for that).
    const timestamp = this.owner.fight.start_time;
    buffs.forEach((buff) => {
      const spell = maybeGetTalentOrSpell(buff.ability);

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
