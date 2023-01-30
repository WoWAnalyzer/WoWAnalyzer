import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/rogue';

import { ROLL_THE_BONES_BUFFS, ROLL_THE_BONES_DURATION } from '../../constants';
import OutlawEnergyCapTracker from 'analysis/retail/rogue/outlaw/modules/core/OutlawEnergyCapTracker';

export const ROLL_THE_BONES_CATEGORIES = {
  LOW_VALUE: 'low',
  HIGH_VALUE: 'high',
};

interface CastValue {
  sleight_of_hand: number;
  base: number;
}

interface BuffValueMap {
  [index: number]: CastValue;
}

export interface RTBCast extends CastEvent {
  appliedBuffs: Spell[];
  duration: number;
  isRefresh: boolean;
  timestampEnd?: number;
  RTBIsDelayed?: boolean;
}

const BROADSIDE_VALUE: CastValue = { sleight_of_hand: 2, base: 3 };
const TRUE_BEARING_VALUE: CastValue = { sleight_of_hand: 2, base: 3 };
const RUTHLESS_PRECISION_VALUE: CastValue = { sleight_of_hand: 2, base: 2 };
const SKULL_AND_CROSSBONES_VALUE: CastValue = { sleight_of_hand: 2, base: 2 };
const BURIED_TREASURE_VALUE: CastValue = { sleight_of_hand: 1, base: 1 };
const GRAND_MELEE_VALUE: CastValue = { sleight_of_hand: 1, base: 1 };

const BUFF_VALUE_BY_ID: BuffValueMap = [];
BUFF_VALUE_BY_ID[SPELLS.BROADSIDE.id] = BROADSIDE_VALUE;
BUFF_VALUE_BY_ID[SPELLS.TRUE_BEARING.id] = TRUE_BEARING_VALUE;
BUFF_VALUE_BY_ID[SPELLS.RUTHLESS_PRECISION.id] = RUTHLESS_PRECISION_VALUE;
BUFF_VALUE_BY_ID[SPELLS.SKULL_AND_CROSSBONES.id] = SKULL_AND_CROSSBONES_VALUE;
BUFF_VALUE_BY_ID[SPELLS.BURIED_TREASURE.id] = BURIED_TREASURE_VALUE;
BUFF_VALUE_BY_ID[SPELLS.GRAND_MELEE.id] = GRAND_MELEE_VALUE;

// e.g. 1 combo point is 12 seconds, 3 combo points is 24 seconds
const PANDEMIC_WINDOW = 0.3;

/**
 * This module will group buffs applied by Roll the Bones by their respective casts
 * The purpose is to make it easier to do analysis on roll efficiency, etc.
 *
 * Roll the Bones itself will have AURA_APPLIED, AURA_REFRESH, and AURA_REMOVED events
 * Buffs granted by RTB will not have their own AURA_REFRESH; only the AURA_APPLIED and AURA_REMOVED events
 * Buffs granted by RTB will not have an AURA_REMOVED nor an AURA_APPLIED if they are being refreshed. They just carry on
 *
 * Order of events when you cast Roll the Bones:
 * AURA_REMOVED for any granted buffs that are dropping off (only if this is a refresh, otherwise they'd just have a separate AURA_REMOVED prior to the cast)
 * AURA_APPLIED/AURA_REFRESH for Roll the Bones
 * AURA_APPLIED for any granted buffs being added
 * CAST_SUCCESS for Roll the Bones
 */
class RollTheBonesCastTracker extends Analyzer {
  get lastCast(): RTBCast {
    return this.rolltheBonesCastEvents[this.rolltheBonesCastEvents.length - 1];
  }

  static dependencies = {
    energyCapTracker: OutlawEnergyCapTracker,
  };
  protected energyCapTracker!: OutlawEnergyCapTracker;

  rolltheBonesCastEvents: RTBCast[] = [];
  rolltheBonesCastValues = Object.values(ROLL_THE_BONES_CATEGORIES).reduce(
    (map: any, label: string) => {
      map[label] = [];
      return map;
    },
    {},
  );

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ROLL_THE_BONES_TALENT),
      this.processCast,
    );
  }

  categorizeCast(cast: RTBCast) {
    let combat_buffs_value = 0;
    cast.appliedBuffs.forEach((buff) => (combat_buffs_value += BUFF_VALUE_BY_ID[buff.id].base));
    if (combat_buffs_value > 2) {
      return ROLL_THE_BONES_CATEGORIES.HIGH_VALUE;
    }

    return ROLL_THE_BONES_CATEGORIES.LOW_VALUE;
  }

  castRemainingDuration(cast: RTBCast) {
    if (!cast.timestampEnd) {
      return 0;
    }

    return cast.duration - (cast.timestampEnd - cast.timestamp);
  }

  processCast(event: CastEvent) {
    if (!event || !event.classResources) {
      return;
    }
    const refresh = this.lastCast
      ? event.timestamp < this.lastCast.timestamp + this.lastCast.duration
      : false;

    // All of the events for adding/removing buffs occur at the same timestamp as the cast, so this.selectedCombatant.hasBuff isn't quite accurate
    const appliedBuffs = ROLL_THE_BONES_BUFFS.filter((b) =>
      this.energyCapTracker.combatantHasBuffActive(b.id),
    );

    let duration = ROLL_THE_BONES_DURATION;

    // If somehow logging starts in the middle of combat and the first cast is actually a refresh, pandemic timing and previous buffs will be missing
    if (refresh && this.lastCast) {
      this.lastCast.timestampEnd = event.timestamp;

      // pandemic works a little differently for rogues. RTB works the same way Rupture works for Assassination
      // the allowed pandemic amount is based on the CURRENT combo points, not the buff/dot that is already applied
      // e.g. 1s remaining, refresh with 30s, final is 31s. 20s remaining, refresh with 30s, final is 39s
      duration += Math.min(this.castRemainingDuration(this.lastCast), duration * PANDEMIC_WINDOW);
    }

    const newCast: RTBCast = {
      ...event,
      appliedBuffs: appliedBuffs,
      duration: duration,
      isRefresh: refresh,
    };

    this.rolltheBonesCastEvents.push(newCast);
    this.rolltheBonesCastValues[this.categorizeCast(newCast)].push(newCast);
  }
}

export default RollTheBonesCastTracker;
