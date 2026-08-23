import { Enchant } from 'common/ITEMS/Item';
import { TIER_BY_CLASSES } from 'common/ITEMS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import { getClassBySpecId } from 'game/CLASSES';
import GEAR_SLOTS from 'game/GEAR_SLOTS';
import Faction, { factionFromWclId } from 'game/Faction';
import RACES, { Race } from 'game/RACES';
import { findByBossId } from 'game/raids';
import SPECS, { Spec } from 'game/SPECS';
import CombatLogParser from 'parser/core/CombatLogParser';
import { Buff, CombatantInfoEvent, EventType, Item, TalentEntry } from 'parser/core/Events';
import { PRIMARY_STAT } from 'parser/shared/modules/features/STAT';
import type { Stats } from 'parser/shared/modules/StatTracker';
import { TIERS } from 'game/TIERS';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { isPresent } from 'common/typeGuards';

import Entity from './Entity';
import { PlayerDetails, PlayerInfo } from './Player';
import { Talent } from 'common/TALENTS/types';
import { IGNORED } from 'common/TALENTS/IGNORED';
import { GenTalent } from './modules/genAbilities';
import { wclGameVersionToBranch } from 'game/VERSIONS';

interface Spell {
  id: number;
}

export type GearSlotName = keyof typeof GEAR_SLOTS;
export type SlotMap<T> = Partial<Record<GearSlotName, T>>;
const BLOODLUST_BUFF_IDS = Object.keys(BLOODLUST_BUFFS).map(Number);

class Combatant extends Entity {
  readonly player: PlayerInfo;

  override get name() {
    return this.player.name;
  }

  get id() {
    return this.player.id;
  }

  readonly specId: number | undefined;

  get spec(): Spec | undefined {
    return this.specId ? SPECS[this.specId] : undefined;
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

  protected combatantInfo: CombatantInfoEvent | undefined;

  get faction(): Faction | undefined {
    if (!this.combatantInfo) {
      return undefined;
    }
    return factionFromWclId(this.combatantInfo.faction);
  }

  /**
   * Player stats at the start of the pull, with any spec-specific `statMultipliers` applied.
   * Frozen at construction; safe to share without copying.
   */
  readonly pullStats: Readonly<Stats> | undefined;

  protected buildPullStats(info: CombatantInfoEvent): Readonly<Stats> {
    const stats: Stats = {
      strength: info.strength,
      agility: info.agility,
      intellect: info.intellect,
      stamina: info.stamina,
      crit: Math.max(info.critSpell ?? 0, info.critMelee ?? 0, info.critRanged ?? 0),
      // Haste is reported per attack type; pick whichever the spec uses.
      // Falls back to 0 because some test fixtures omit all three fields.
      haste: Math.max(info.hasteSpell ?? 0, info.hasteMelee ?? 0, info.hasteRanged ?? 0),
      mastery: info.mastery,
      versatility: info.versatilityHealingDone,
      avoidance: info.avoidance,
      leech: info.leech,
      speed: info.speed,
      armor: info.armor,
    };
    const modifiers = this.owner.config.statMultipliers;
    if (modifiers) {
      for (const [stat, multiplier] of Object.entries(modifiers)) {
        if (multiplier !== undefined) {
          stats[stat as keyof Stats] *= multiplier;
        }
      }
    }
    return Object.freeze(stats);
  }

  readonly ilvl: number | undefined;

  constructor(parser: CombatLogParser, player: PlayerDetails) {
    super(parser);

    this.player = this.owner.players.find((info) => info.id === player.id)!;
    this.specId =
      player.specID ??
      Object.values(SPECS).find(
        (spec) =>
          spec.wclClassName === player.className &&
          spec.wclSpecName &&
          player.specName &&
          spec.branch === wclGameVersionToBranch(this.owner.report.gameVersion),
      )?.id;
  }

  // region Talents
  private classicTalentPoints: Set<number> = new Set<number>();

  protected parseTalents(talents: Spell[]) {
    talents?.forEach(({ id }) => {
      this.classicTalentPoints.add(id);
    });
  }

  private treeTalentsByEntryId = new Map<number, TalentEntry>();
  protected importTalentTree(talents: TalentEntry[]) {
    talents?.forEach((talent) => {
      this.treeTalentsByEntryId.set(talent.id, talent);
    });
  }

  get talentTree(): TalentEntry[] {
    return this.combatantInfo?.talentTree.filter((it) => !IGNORED.includes(it.id)) ?? [];
  }

  hasClassicTalent(spell: number | { id: number }): boolean {
    const id = typeof spell === 'number' ? spell : spell.id;
    return this.classicTalentPoints.has(id);
  }

  /** Returns true if this combatant has the specified talent. Will be true for any number of
   *  points in the talent, even when not the maximum number of points. */
  hasTalent(talent: Talent | GenTalent): boolean {
    return Combatant.entryIds(talent).some((entryId) => this.treeTalentsByEntryId.has(entryId));
  }

  private static entryIds(talent: Talent | GenTalent): number[] {
    if ('requiresTalentEntry' in talent) {
      return talent.requiresTalentEntry;
    } else {
      return talent.entryIds;
    }
  }

  /**
   * Return the number of ranks that the provided talents have in total.
   * Useful for repeated talents (like Empower Rune Weapon or Stormkeeper).
   */
  getMultipleTalentRanks(...talents: (Talent | GenTalent)[]): number {
    return talents.reduce((count, talent) => count + this.getTalentRank(talent), 0);
  }

  /** Returns the number of points the combatant has in the specified talent. If the talent
   *  hasn't been picked at all, this will be zero. */
  getTalentRank(talent: Talent | GenTalent) {
    const foundEntryId = Combatant.entryIds(talent).find((entryId) =>
      this.treeTalentsByEntryId.has(entryId),
    );
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

  private glyphIds?: Set<number>;

  protected importGlyphs(event: CombatantInfoEvent) {
    if (event.customPowerSet) {
      this.glyphIds = new Set(event.customPowerSet.map((power) => power.traitID));
    }
  }

  hasGlyph(id: number): boolean {
    return this.glyphIds?.has(id) ?? false;
  }

  // endregion

  hasWeaponEnchant(enchant: Enchant) {
    return (
      this.getGear('MAINHAND')?.permanentEnchant === enchant.effectId ||
      this.getGear('OFFHAND')?.permanentEnchant === enchant.effectId
    );
  }

  inBloodlust(forTimestamp: number | null = null): boolean {
    return BLOODLUST_BUFF_IDS.some((spellId) => this.hasBuff(spellId, forTimestamp));
  }

  // region Gear
  private gearItemsBySlotId: Record<number, Item> = {};
  private gearItemsById = new Map<number, Item>();

  protected parseGear(gear: Item[]) {
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

      this.gearItemsBySlotId[index] = equippedItem;
      this.gearItemsById.set(equippedItem.id, equippedItem);
    });
  }

  get gear() {
    return Object.values(this.gearItemsBySlotId);
  }

  getGear(slot: GearSlotName): Item | undefined {
    return this.gearItemsBySlotId[GEAR_SLOTS[slot]];
  }

  hasGear(slot: GearSlotName, itemId: number): boolean {
    return this.getGear(slot)?.id === itemId;
  }

  getFinger(itemId: number): Item | undefined {
    const finger1 = this.getGear('FINGER1');
    if (finger1?.id === itemId) {
      return finger1;
    }
    const finger2 = this.getGear('FINGER2');
    if (finger2?.id === itemId) {
      return finger2;
    }
    return undefined;
  }

  hasFinger(itemId: number): boolean {
    return this.getFinger(itemId) !== undefined;
  }

  getTrinket(itemId: number): Item | undefined {
    const trinket1 = this.getGear('TRINKET1');
    if (trinket1?.id === itemId) {
      return trinket1;
    }
    const trinket2 = this.getGear('TRINKET2');
    if (trinket2?.id === itemId) {
      return trinket2;
    }
    return undefined;
  }

  hasTrinket(itemId: number): boolean {
    return this.getTrinket(itemId) !== undefined;
  }

  getItem(itemId: number): Item | undefined {
    return this.gearItemsById.get(itemId);
  }

  // endregion

  // region Tier
  get tierPieces(): Item[] {
    return [
      this.getGear('HEAD'),
      this.getGear('SHOULDER'),
      this.getGear('CHEST'),
      this.getGear('LEGS'),
      this.getGear('HANDS'),
    ].filter(isPresent);
  }

  setIdBySpecByTier(tier: TIERS) {
    if (this.specId === undefined) {
      return undefined;
    }
    return TIER_BY_CLASSES[tier]?.[getClassBySpecId(this.specId)];
  }

  has2PieceByTier(tier: TIERS) {
    const setID = this.setIdBySpecByTier(tier);
    if (!setID) {
      console.error('Unable to find set ID for spec and tier');
      return false;
    }
    return this.tierPieces.filter((gear) => gear.setID === setID).length >= 2;
  }

  has4PieceByTier(tier: TIERS) {
    const setID = this.setIdBySpecByTier(tier);
    if (!setID) {
      console.error('Unable to find set ID for spec and tier');
      return false;
    }
    return this.tierPieces.filter((gear) => gear.setID === setID).length >= 4;
  }

  // endregion

  protected parsePrepullBuffs(buffs: Buff[]) {
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

/**
 * The combatant representing the player, which always has full details.
 */
export class FullCombatant extends Combatant {
  protected override combatantInfo: CombatantInfoEvent;
  override readonly pullStats: Readonly<Stats>;
  override readonly ilvl: number | undefined;
  readonly specId: number;

  override get faction(): Faction {
    return super.faction!;
  }

  constructor(parser: CombatLogParser, player: PlayerDetails, combatantInfo: CombatantInfoEvent) {
    super(parser, player);

    if (import.meta.env.MODE === 'test') {
      this.specId = player.specID ?? parser.config?.spec?.id ?? -1;
    } else {
      this.specId = player.specID ?? parser.config.spec.id;
    }

    this.combatantInfo = {
      ...combatantInfo,
    };

    this.parseTalents(combatantInfo.talents);
    this.importTalentTree(combatantInfo.talentTree);
    this.parseGear(combatantInfo.gear);
    this.parsePrepullBuffs(combatantInfo.auras);
    this.importGlyphs(combatantInfo);

    this.pullStats = this.buildPullStats(combatantInfo);

    this.ilvl =
      this.gear.length > 0
        ? this.gear.map((item) => item.itemLevel).reduce((sum, val) => sum + val, 0) /
          this.gear.length
        : undefined;
  }
}
