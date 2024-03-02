import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ITEMS from 'common/ITEMS/dragonflight/others';
// import SPELLS from 'common/SPELLS/dragonflight/others';
import SPELLS from 'common/SPELLS';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import Events, { CastEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const debug = false;

const IRIDAL_EXECUTE_RANGE = 0.35;
const IRIDAL_BASE_CD = 180000;
const IRIDAL_INTERNAL_CD = 1000;
const IRIDAL_CD_REDUCTION = 1000;

const FILTERED_SPELL_IDS = [
  SPELLS.IRIDAL_EXTINCTION_BLAST_DAMAGE.id,
  SPELLS.NYMUES_UNRAVELING_SPINDLE.id,
  // warlock spells
  388070, // inquisitor's gaze / fel barrage damage
  SPELLS.DOOM_BRAND_DAMAGE.id,
];

// todo add cdr
class Iridal extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = IRIDAL_EXECUTE_RANGE;
  static countCooldownAsExecuteTime = true;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
    spellUsable: SpellUsable,
  };
  protected abilities!: Abilities;

  protected maxCasts = 0;
  protected cdrApplied = 0;
  protected lastCDRApplied = -1000;
  protected iridalCasts = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasMainHand(ITEMS.IRIDAL_THE_EARTHS_MASTER.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(SPELLS.IRIDAL_EXTINCTION_BLAST_DAMAGE);

    (options.abilities as Abilities).add({
      spell: SPELLS.IRIDAL_EXTINCTION_BLAST_DAMAGE.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 180,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
        maxCasts: () => this.maxCasts,
      },
      damageSpellIds: [SPELLS.IRIDAL_EXTINCTION_BLAST_DAMAGE.id],
    });

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IRIDAL_EXTINCTION_BLAST_DAMAGE),
      this.onIridalCast,
    );
  }

  adjustMaxCasts(event: FightEndEvent) {
    super.onFightEnd(event);
    this.maxCasts += Math.ceil(
      this.totalExecuteDuration / (IRIDAL_BASE_CD - this.cdrApplied / this.iridalCasts),
    );
    // this will underestimate the casts, fix statistic if too underestimated
    this.maxCasts = Math.max(this.maxCasts, this.iridalCasts);
    debug && this.debug('iridal cdr applied:', this.cdrApplied, 'max casts:', this.maxCasts);
  }

  onIridalCast(event: CastEvent) {
    this.iridalCasts += 1;
  }

  onDamage(event: DamageEvent) {
    if (this.spellUsable.isAvailable(SPELLS.IRIDAL_EXTINCTION_BLAST_DAMAGE.id)) {
      return;
    }
    if (event.timestamp < this.lastCDRApplied + IRIDAL_INTERNAL_CD) {
      return;
    }
    if (event.targetIsFriendly) {
      return;
    }
    if (FILTERED_SPELL_IDS.includes(event.ability?.guid)) {
      return;
    }
    if (IRIDAL_EXECUTE_RANGE < (event.hitPoints || 0) / (event.maxHitPoints || 1)) {
      return;
    }

    debug &&
      this.debug(
        'iridal cd reduced by',
        event.ability.name,
        event.ability.guid,
        'hp%',
        (event.hitPoints || 0) / (event.maxHitPoints || 1),
      );
    this.spellUsable.reduceCooldown(SPELLS.IRIDAL_EXTINCTION_BLAST_DAMAGE.id, IRIDAL_CD_REDUCTION);
    this.cdrApplied += IRIDAL_CD_REDUCTION;
    this.lastCDRApplied = event.timestamp;
  }
}

export default Iridal;
