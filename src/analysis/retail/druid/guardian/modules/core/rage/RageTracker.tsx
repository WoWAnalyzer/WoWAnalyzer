import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Events, { CastEvent, DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';

/** Internally, all rage values are out of 1000, but player facing they are out of 100 */
export const RAGE_SCALE_FACTOR = 0.1;

export const BERSERK_UA_COST_MULT = 0.5;
export const BERSERK_PERSISTENCE_COST_MULT = 0.5;
export const GORY_FUR_COST_MULT = 0.75;

// buffer after expiration to make sure reduction is cost
export const GORY_FUR_BUFFER = 30;

export const PERFECT_TIME_AT_RAGE_CAP = 0.05;
export const GOOD_TIME_AT_RAGE_CAP = 0.1;
export const OK_TIME_AT_RAGE_CAP = 0.2;

const RAW_RAGE_GAINED_FROM_MELEE = 40;

export default class RageTracker extends ResourceTracker {
  hasBerserkUA: boolean;
  hasBerserkPersistence: boolean;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RAGE;

    this.hasBerserkUA = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.BERSERK_UNCHECKED_AGGRESSION_TALENT,
    );
    this.hasBerserkPersistence = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.BERSERK_PERSISTENCE_TALENT,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE),
      this.onPlayerMelee,
    );
  }

  /** Gain values are only event values not scaled for some reason */
  getAdjustedGain(event: ResourceChangeEvent): { gain: number; waste: number } {
    const baseGain = super.getAdjustedGain(event);
    return { gain: baseGain.gain / RAGE_SCALE_FACTOR, waste: baseGain.waste / RAGE_SCALE_FACTOR };
  }

  /** Cost values during Berserk aren't properly changed from baseline */
  getAdjustedCost(event: CastEvent): number | undefined {
    let resourceCost = this.getResource(event)?.cost;
    if (!resourceCost) {
      return undefined;
    }

    const spellId = event.ability.guid;
    if (
      this.selectedCombatant.hasBuff(SPELLS.BERSERK.id) ||
      this.selectedCombatant.hasBuff(TALENTS_DRUID.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id)
    ) {
      if (
        this.hasBerserkUA &&
        (spellId === SPELLS.MAUL.id || spellId === TALENTS_DRUID.RAZE_TALENT.id)
      ) {
        resourceCost *= BERSERK_UA_COST_MULT;
      } else if (this.hasBerserkPersistence && spellId === SPELLS.IRONFUR.id) {
        resourceCost *= BERSERK_PERSISTENCE_COST_MULT;
      }
    }

    if (
      this.selectedCombatant.hasBuff(SPELLS.GORY_FUR_BUFF.id, null, GORY_FUR_BUFFER) &&
      spellId === SPELLS.IRONFUR.id
    ) {
      resourceCost *= GORY_FUR_COST_MULT;
    }

    return resourceCost;
  }

  onPlayerMelee(event: DamageEvent) {
    // TODO is it different for dodge / parry?
    this.processInvisibleEnergize(SPELLS.MELEE.id, RAW_RAGE_GAINED_FROM_MELEE, event.timestamp);
  }

  get wastedPerformance(): QualitativePerformance {
    const total = this.wasted + this.generated;
    const percentWasted = total === 0 ? 0 : this.wasted / total;
    if (percentWasted === PERFECT_TIME_AT_RAGE_CAP) {
      return QualitativePerformance.Perfect;
    }
    if (percentWasted <= GOOD_TIME_AT_RAGE_CAP) {
      return QualitativePerformance.Good;
    }
    if (percentWasted <= OK_TIME_AT_RAGE_CAP) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }
}
