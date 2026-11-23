import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Combatants from 'parser/shared/modules/Combatants';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ENGINEERING_SPELLS from 'common/SPELLS/midnight/engineering';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS/midnight/engineering';
import Spell from 'common/SPELLS/Spell';
import { isMythicPlus } from 'common/isMythicPlus';
import DIFFICULTIES from 'game/DIFFICULTIES';
import Haste from 'parser/shared/modules/Haste';

/** Personal cooldown of the item outside of a shared battle res pool (seconds). */
const ITEM_COOLDOWN = 600;
/** Raid boss encounters: the pool gains 1 charge every (90 / raid size) minutes. */
const RAID_POOL_MINUTES = 90;
/** Mythic+: the pool gains 1 charge every 10 minutes, independent of group size. */
const MYTHIC_PLUS_RECHARGE = 600;

const RAID_DIFFICULTIES: number[] = [
  DIFFICULTIES.LFR_RAID,
  DIFFICULTIES.NORMAL_RAID,
  DIFFICULTIES.HEROIC_RAID,
  DIFFICULTIES.MYTHIC_RAID,
];

/** The use spell differs per craft quality */
const RANKS = [
  {
    spell: ENGINEERING_SPELLS.EMERGENCY_SOUL_LINK_R1,
    craftQuality: ITEMS.EMERGENCY_SOUL_LINK_R1.craftQuality,
    baseCastTime: 6000,
  },
  {
    spell: ENGINEERING_SPELLS.EMERGENCY_SOUL_LINK_R2,
    craftQuality: ITEMS.EMERGENCY_SOUL_LINK_R2.craftQuality,
    baseCastTime: 3000,
  },
];
const ITEM_SPELLS = RANKS.map((rank) => rank.spell);
const ITEM_SPELL_IDS = ITEM_SPELLS.map((spell) => spell.id);

/**
 * Class battle res abilities that draw from the same cooldown/pool as the item.
 * Self-resurrections (Reincarnation, Spirit of Redemption) are not part of the pool.
 */
const CLASS_BATTLE_RES: Spell[] = [
  SPELLS.REBIRTH,
  SPELLS.RAISE_ALLY,
  SPELLS.SOULSTONE,
  SPELLS.INTERCESSION,
];

export interface EmergencySoulLinkCast {
  spellId: number;
  craftQuality: number;
  start: number;
  end?: number;
  /** Haste at the start of the cast, as a fraction (0.2 = 20%). */
  haste: number;
  /** Expected cast time in ms: base cast time of the rank, scaled by haste. */
  expectedCastTime: number;
  /** Measured cast time in ms (begincast -> cast). Undefined if cancelled. */
  actualCastTime?: number;
  cancelled: boolean;
}

export default class EmergencySoulLink extends Analyzer.withDependencies({
  abilities: Abilities,
  combatants: Combatants,
  haste: Haste,
  spellUsable: SpellUsable,
}) {
  casts: EmergencySoulLinkCast[] = [];
  private pendingCast: EmergencySoulLinkCast | null = null;

  /** Returns the expected cast time in ms for the given use spell id and haste fraction. */
  static expectedCastTime(spellId: number, haste: number): number {
    const rank = RANKS.find((r) => r.spell.id === spellId);
    return rank ? rank.baseCastTime / (1 + haste) : 0;
  }

  constructor(options: Options) {
    super(options);

    this.deps.abilities.add({
      spell: ITEM_SPELL_IDS,
      category: SPELL_CATEGORY.CONSUMABLE,
      cooldown: this.sharedCooldown,
      gcd: null,
      castEfficiency: {
        suggestion: false,
      },
    });

    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(ITEM_SPELLS),
      this.onBeginCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(ITEM_SPELLS), this.onItemCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(CLASS_BATTLE_RES),
      this.onClassBattleResCast,
    );
  }
  /** Battle res cooldown in seconds for the current fight. */
  get sharedCooldown(): number {
    const fight = this.owner.fight;
    if (isMythicPlus(fight)) {
      return MYTHIC_PLUS_RECHARGE;
    }
    const isRaidBoss =
      fight.boss > 0 &&
      fight.difficulty !== undefined &&
      RAID_DIFFICULTIES.includes(fight.difficulty);
    if (isRaidBoss) {
      const raidSize = fight.size || this.deps.combatants.playerCount;
      if (raidSize > 0) {
        return (RAID_POOL_MINUTES * 60) / raidSize;
      }
    }
    return ITEM_COOLDOWN;
  }

  private onBeginCast(event: BeginCastEvent) {
    const rank = RANKS.find((r) => r.spell.id === event.ability.guid)!;
    const haste = this.deps.haste.current;
    const cast: EmergencySoulLinkCast = {
      spellId: rank.spell.id,
      craftQuality: rank.craftQuality,
      start: event.timestamp,
      haste,
      expectedCastTime: EmergencySoulLink.expectedCastTime(rank.spell.id, haste),
      cancelled: event.isCancelled,
    };
    this.casts.push(cast);
    this.pendingCast = event.isCancelled ? null : cast;
  }

  private onItemCast(event: CastEvent) {
    const cast = this.pendingCast;
    if (cast && cast.spellId === event.ability.guid) {
      cast.end = event.timestamp;
      cast.actualCastTime = event.timestamp - cast.start;
    }
    this.pendingCast = null;

    // the item shares its cooldown with the player's own class battle res
    CLASS_BATTLE_RES.forEach((spell) => {
      if (this.deps.abilities.getAbility(spell.id)) {
        this.deps.spellUsable.beginCooldown(event, spell.id);
      }
    });
  }

  private onClassBattleResCast(event: CastEvent) {
    this.deps.spellUsable.beginCooldown(event, ITEM_SPELL_IDS[0]);
  }
}
